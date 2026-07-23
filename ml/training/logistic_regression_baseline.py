"""Clasificación de riesgo — baseline de Regresión Logística (sección 10.1 del informe).

Grano: región-día (FACT_MONITOREO_DIARIO). Target: ¿ocurrirá una emergencia de severidad ALTA
en esta región dentro de los próximos 7 días?

Por qué severidad ALTA y no "cualquier emergencia": se probó con datos reales y "cualquier
emergencia en 7 días" da 72.3% de casos positivos (INDECI registra hasta incidentes menores como
emergencia) — un objetivo casi trivial de predecir, sin valor real como alerta temprana. Con solo
severidad ALTA (fallecidos/desaparecidos o >=10 viviendas destruidas, ver
data/gold/fact_emergencias.py) el positivo baja a 7.4%, un objetivo desbalanceado pero genuinamente
útil: anticipar el tipo de emergencia donde una alerta temprana real importaría.

Split temporal (no aleatorio): entrena con 2012-2020, evalúa con 2021-2023, para simular
condiciones reales de pronóstico (no se "espía" el futuro durante el entrenamiento).

Métricas: F1-score, precisión, recall, AUC-ROC (sección 10.1), comparadas contra las metas de la
sección 11.1 (F1>=0.75, AUC-ROC>=0.80, recall>=0.70) — este es el baseline interpretable, se
espera que Random Forest/XGBoost (sección 10.1, modelo principal) lo supere.

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
    "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos",
]
VENTANA_LABEL_DIAS = 7
FECHA_CORTE_TRAIN_TEST = "2021-01-01"  # train: 2012-2020, test: 2021-2023

METAS = {"f1": 0.75, "auc_roc": 0.80, "recall": 0.70}


def construir_dataset() -> pd.DataFrame:
    monitoreo = pd.read_parquet(GOLD_DIR / "fact_monitoreo_diario.parquet")
    emergencias = pd.read_parquet(GOLD_DIR / "fact_emergencias.parquet")
    tiempo = pd.read_parquet(GOLD_DIR / "dim_tiempo.parquet")[["fecha_id", "fecha"]]

    df = monitoreo.merge(tiempo, on="fecha_id").sort_values(["region_id", "fecha"])
    df["magnitud_max_7d"] = df["magnitud_max_7d"].fillna(0)

    emerg_alta = emergencias[emergencias["severidad"] == "ALTO"].merge(tiempo, on="fecha_id")
    dias_alta = emerg_alta[["region_id", "fecha"]].drop_duplicates()
    dias_alta["tuvo_emergencia_alta"] = 1

    df = df.merge(dias_alta, on=["region_id", "fecha"], how="left")
    df["tuvo_emergencia_alta"] = df["tuvo_emergencia_alta"].fillna(0)

    # Label hacia adelante: 1 si hay una emergencia ALTA en los próximos VENTANA_LABEL_DIAS días
    # (sin contar el día actual, para no filtrar información del propio día al predictor).
    df["label"] = (
        df.groupby("region_id")["tuvo_emergencia_alta"]
        .transform(
            lambda s: s.shift(-1)[::-1].rolling(VENTANA_LABEL_DIAS, min_periods=1).max()[::-1]
        )
    )
    df["label"] = df["label"].fillna(0).astype(int)
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
