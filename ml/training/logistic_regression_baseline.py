"""Clasificación de riesgo — baseline de Regresión Logística (sección 10.1 del informe).

Grano: región-día (FACT_MONITOREO_DIARIO). Target: ¿ocurrirá una emergencia de severidad
MEDIA o ALTA, de origen Hidrometeorológico y Oceanográfico, en esta región dentro de los
próximos 7 días?

Cómo se llegó a este target (documentado porque cambió dos veces con evidencia real):
1. "Cualquier emergencia en 7 días" da 72.3% de positivos (INDECI registra hasta incidentes
   menores) — casi trivial de predecir, sin valor real.
2. Solo severidad ALTA (sin filtrar por categoría) da 7.4% de positivos, pero el AUC-ROC no pasó
   de 0.53-0.62 con varios modelos. Al revisar la composición se encontró que solo 60% de esas
   emergencias ALTO son de origen climático — el resto son accidentes de tránsito, incendios
   urbanos, explosiones y epidemias, que no tienen ninguna relación causal con clima/sismos/
   focos de calor (y la sección 2.4 del informe ya descarta explícitamente predecir sismos).
   Pedirle al modelo predecir esos eventos junto con los climáticos diluía cualquier señal real.
3. Restringiendo a MEDIO+ALTO y solo categoría Hidrometeorológico y Oceanográfico (ver
   data/gold/dim_fenomeno.py), el AUC-ROC subió a ~0.67-0.75 según el modelo — una mejora
   sustancial y ahora coherente con lo que las fuentes de monitoreo pueden explicar causalmente.

Split temporal (no aleatorio): entrena con 2012-2020, evalúa con 2021-2023, para simular
condiciones reales de pronóstico (no se "espía" el futuro durante el entrenamiento).

Este baseline usa deliberadamente un set de features simple (clima/sismos/incendios del día +
mes), sin las features más elaboradas de ml/training/random_forest_xgboost.py (tasa histórica
región-mes, índice El Niño), para que la comparación baseline-vs-modelo-principal sea real.

Métricas: F1-score, precisión, recall, AUC-ROC (sección 10.1), comparadas contra las metas de la
sección 11.1 (F1>=0.75, AUC-ROC>=0.80, recall>=0.70).

Uso:
    python logistic_regression_baseline.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.preprocessing import StandardScaler

GOLD_DIR = Path(__file__).parent.parent.parent / "data" / "gold" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"

FEATURES = [
    "temp_max", "temp_min", "precipitacion_mm",
    "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos", "mes",
]
VENTANA_LABEL_DIAS = 7
FECHA_CORTE_TRAIN_TEST = "2021-01-01"  # train: 2012-2020, test: 2021-2023
SEVERIDADES_TARGET = ["MEDIO", "ALTO"]
CATEGORIA_TARGET = "HIDROMETEOROLOGICO Y OCEANOGRAFICO"

METAS = {"f1": 0.75, "auc_roc": 0.80, "recall": 0.70}


def construir_dataset() -> pd.DataFrame:
    monitoreo = pd.read_parquet(GOLD_DIR / "fact_monitoreo_diario.parquet")
    emergencias = pd.read_parquet(GOLD_DIR / "fact_emergencias.parquet")
    fenomeno = pd.read_parquet(GOLD_DIR / "dim_fenomeno.parquet")[["fenomeno_id", "categoria"]]
    tiempo = pd.read_parquet(GOLD_DIR / "dim_tiempo.parquet")[["fecha_id", "fecha"]]

    emergencias = emergencias.merge(fenomeno, on="fenomeno_id")

    df = monitoreo.merge(tiempo, on="fecha_id").sort_values(["region_id", "fecha"])
    df["magnitud_max_7d"] = df["magnitud_max_7d"].fillna(0)
    df["mes"] = df["fecha"].dt.month

    objetivo = emergencias[
        emergencias["severidad"].isin(SEVERIDADES_TARGET) & (emergencias["categoria"] == CATEGORIA_TARGET)
    ].merge(tiempo, on="fecha_id")
    dias_objetivo = objetivo[["region_id", "fecha"]].drop_duplicates()
    dias_objetivo["tuvo_emergencia"] = 1

    df = df.merge(dias_objetivo, on=["region_id", "fecha"], how="left")
    df["tuvo_emergencia"] = df["tuvo_emergencia"].fillna(0)

    # Label hacia adelante: 1 si hay una emergencia objetivo en los próximos VENTANA_LABEL_DIAS
    # días (sin contar el día actual, para no filtrar información del propio día al predictor).
    df["label"] = (
        df.groupby("region_id")["tuvo_emergencia"]
        .transform(
            lambda s: s.shift(-1)[::-1].rolling(VENTANA_LABEL_DIAS, min_periods=1).max()[::-1]
        )
    )
    df["label"] = df["label"].fillna(0).astype(int)

    # El modelo se entrena/evalúa SOLO en la ventana etiquetada 2012-2023 (las emergencias de
    # INDECI terminan en 2023). Aunque FACT_MONITOREO_DIARIO ahora se extiende a fechas recientes
    # para el dashboard, esos días no tienen etiqueta y no deben entrar al train/test del modelo.
    df = df[df["fecha"] <= pd.Timestamp("2023-12-31")].reset_index(drop=True)
    return df


def entrenar_evaluar(df: pd.DataFrame) -> dict:
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    train = df[df["fecha"] < corte]
    test = df[df["fecha"] >= corte]

    escalador = StandardScaler().fit(train[FEATURES])
    X_train = escalador.transform(train[FEATURES])
    X_test = escalador.transform(test[FEATURES])
    y_train, y_test = train["label"], test["label"]

    modelo = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
    modelo.fit(X_train, y_train)

    y_pred = modelo.predict(X_test)
    y_proba = modelo.predict_proba(X_test)[:, 1]

    metricas = {
        "f1": round(f1_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "auc_roc": round(roc_auc_score(y_test, y_proba), 4),
    }
    cumple_meta = {k: bool(metricas[k] >= v) for k, v in METAS.items()}

    coeficientes = dict(zip(FEATURES, [round(c, 4) for c in modelo.coef_[0]]))

    return {
        "n_train": len(train),
        "n_test": len(test),
        "pct_positivos_train": round(float(y_train.mean()), 4),
        "pct_positivos_test": round(float(y_test.mean()), 4),
        "metricas": metricas,
        "metas": METAS,
        "cumple_meta": cumple_meta,
        "todas_las_metas_ok": all(cumple_meta.values()),
        "coeficientes": coeficientes,
    }


def main() -> None:
    df = construir_dataset()
    print(f"Dataset: {len(df)} filas región-día, {df['label'].mean()*100:.1f}% positivos (global).")

    reporte = entrenar_evaluar(df)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reporte_path = OUTPUT_DIR / "logistic_regression_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Train: {reporte['n_train']} filas ({reporte['pct_positivos_train']*100:.1f}% positivos)")
    print(f"Test:  {reporte['n_test']} filas ({reporte['pct_positivos_test']*100:.1f}% positivos)")
    print(f"Métricas: {reporte['metricas']}")
    print(f"Cumple metas (sección 11.1): {reporte['cumple_meta']}")
    print(f"Coeficientes: {reporte['coeficientes']}")
    print(f"Guardado en {reporte_path}")


if __name__ == "__main__":
    main()
