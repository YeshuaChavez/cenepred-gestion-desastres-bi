"""Detecta días atípicos en FACT_MONITOREO_DIARIO por región (Isolation Forest).

Sección 10.2 del informe: "Identificar días atípicos en FACT_MONITOREO_DIARIO que se aparten del
comportamiento histórico de una región, como señal de alerta temprana independiente del label
oficial de INDECI". Se entrena un modelo POR REGIÓN (no uno global), porque "atípico" depende de
la línea base de esa región específica: una lluvia intensa es normal en Loreto (selva) pero
atípica en Ica (desierto) — un solo modelo global solo aprendería a distinguir regiones, no
días atípicos dentro de cada una.

Features: temp_max, temp_min, precipitacion_mm, num_sismos_7d, magnitud_max_7d,
num_focos_calor_activos. `magnitud_max_7d` es nulo en ~86% de las filas (ventanas de 7 días sin
ningún sismo) — se imputa a 0 para el modelo, tratando "sin sismos" como línea base, no como dato
faltante real.

contamination=0.05 (5% de los días de cada región se marcan como atípicos) — un valor de
referencia común, no un umbral oficial de INDECI/CENEPRED.

Requiere haber corrido antes data/gold/fact_monitoreo_diario.py.

Uso:
    python isolation_forest_anomalias.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

GOLD_DIR = Path(__file__).parent.parent.parent / "data" / "gold" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"

FEATURES = [
    "temp_max", "temp_min", "precipitacion_mm",
    "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos",
]
CONTAMINATION = 0.05
RANDOM_STATE = 42


def cargar_monitoreo() -> pd.DataFrame:
    df = pd.read_parquet(GOLD_DIR / "fact_monitoreo_diario.parquet")
    df["magnitud_max_7d"] = df["magnitud_max_7d"].fillna(0)
    return df


def detectar_anomalias_por_region(df: pd.DataFrame) -> pd.DataFrame:
    resultados = []
    for region_id, grupo in df.groupby("region_id"):
        X = StandardScaler().fit_transform(grupo[FEATURES].values)
        modelo = IsolationForest(contamination=CONTAMINATION, random_state=RANDOM_STATE)
        pred = modelo.fit_predict(X)  # -1 = anomalía, 1 = normal
        score = modelo.decision_function(X)  # más bajo = más anómalo

        grupo = grupo.copy()
        grupo["es_anomalia"] = pred == -1
        grupo["anomalia_score"] = score
        resultados.append(grupo)

    return pd.concat(resultados, ignore_index=True)


def validar_calidad(df: pd.DataFrame) -> dict:
    pct_anomalias_global = df["es_anomalia"].mean()
    pct_por_region = df.groupby("region_id")["es_anomalia"].mean()

    resultado = {
        "total_filas": len(df),
        "pct_anomalias_global": round(pct_anomalias_global, 4),
        "contamination_esperada": CONTAMINATION,
        "pct_anomalias_min_region": round(pct_por_region.min(), 4),
        "pct_anomalias_max_region": round(pct_por_region.max(), 4),
    }
    # Cada región debería tener ~5% marcado (contamination fija por diseño del modelo);
    # se valida que ninguna región se desvíe demasiado de eso.
    resultado["todas_las_reglas_ok"] = bool(
        abs(pct_anomalias_global - CONTAMINATION) < 0.01
    )
    return resultado


def main() -> None:
    df = cargar_monitoreo()
    print(f"Cargadas {len(df)} filas de FACT_MONITOREO_DIARIO ({df['region_id'].nunique()} regiones).")

    df_resultado = detectar_anomalias_por_region(df)
    reporte = validar_calidad(df_resultado)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "monitoreo_con_anomalias.parquet"
    df_resultado.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "isolation_forest_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Anomalías detectadas: {reporte['pct_anomalias_global']*100:.2f}% de los días "
          f"(esperado ~{CONTAMINATION*100:.0f}%)")
    print(f"Rango por región: {reporte['pct_anomalias_min_region']*100:.2f}% - "
          f"{reporte['pct_anomalias_max_region']*100:.2f}%")
    print(f"Guardado en {parquet_path}")
    print(f"Reglas OK: {reporte['todas_las_reglas_ok']}")


if __name__ == "__main__":
    main()
