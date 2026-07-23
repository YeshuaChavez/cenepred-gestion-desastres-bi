"""Clasificación de riesgo — modelo principal: Random Forest / XGBoost (sección 10.1).

Mismo dataset y target que el baseline (ml/training/logistic_regression_baseline.py): grano
región-día, target = emergencia de severidad ALTA en los próximos 7 días, split temporal
2012-2020 train / 2021-2023 test.

Se agregan dos features respecto al baseline: `precipitacion_acumulada_15d` (suma móvil de 15
días, el mismo ejemplo que usa el informe en la sección 10.3 para SHAP) y `mes` (estacionalidad).
El baseline con solo el clima/sismos/incendios del día tenía correlación casi nula con el label
(máx. 0.08). Probado con datos reales: agregar precipitación acumulada subió el AUC-ROC de 0.53
(baseline) a ~0.60; agregar además `mes` lo subió a 0.62 — resultó ser la feature más importante
de todas (42% de importancia en XGBoost), confirmando que el riesgo de emergencias severas en
Perú tiene un componente estacional fuerte (huaicos/inundaciones concentrados en época de
lluvias) que las condiciones del día por sí solas no capturan.

Uso:
    python random_forest_xgboost.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from xgboost import XGBClassifier

sys.path.insert(0, str(Path(__file__).parent))
from logistic_regression_baseline import (  # noqa: E402
    FECHA_CORTE_TRAIN_TEST,
    METAS,
    construir_dataset as construir_dataset_base,
)

OUTPUT_DIR = Path(__file__).parent / "local_data"

FEATURES = [
    "temp_max", "temp_min", "precipitacion_mm", "precipitacion_acumulada_15d",
    "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos", "mes",
]


def construir_dataset() -> pd.DataFrame:
    df = construir_dataset_base()
    df["precipitacion_acumulada_15d"] = (
        df.groupby("region_id")["precipitacion_mm"]
        .transform(lambda s: s.rolling(15, min_periods=1).sum())
    )
    df["mes"] = df["fecha"].dt.month
    return df


def evaluar(y_test, y_pred, y_proba) -> dict:
    metricas = {
        "f1": round(f1_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "auc_roc": round(roc_auc_score(y_test, y_proba), 4),
    }
    cumple_meta = {k: bool(metricas[k] >= v) for k, v in METAS.items()}
    return {"metricas": metricas, "cumple_meta": cumple_meta, "todas_las_metas_ok": all(cumple_meta.values())}


def entrenar_random_forest(train, test):
    modelo = RandomForestClassifier(
        n_estimators=300, max_depth=10, min_samples_leaf=20,
        class_weight="balanced", random_state=42, n_jobs=-1,
    )
    modelo.fit(train[FEATURES], train["label"])
    y_pred = modelo.predict(test[FEATURES])
    y_proba = modelo.predict_proba(test[FEATURES])[:, 1]
    reporte = evaluar(test["label"], y_pred, y_proba)
    reporte["importancias"] = dict(zip(FEATURES, [round(v, 4) for v in modelo.feature_importances_]))
    return reporte


def entrenar_xgboost(train, test):
    # scale_pos_weight compensa el desbalance (equivalente a class_weight="balanced").
    ratio = (train["label"] == 0).sum() / (train["label"] == 1).sum()
    modelo = XGBClassifier(
        n_estimators=300, max_depth=5, learning_rate=0.05,
        scale_pos_weight=ratio, random_state=42, eval_metric="logloss",
    )
    modelo.fit(train[FEATURES], train["label"])
    y_pred = modelo.predict(test[FEATURES])
    y_proba = modelo.predict_proba(test[FEATURES])[:, 1]
    reporte = evaluar(test["label"], y_pred, y_proba)
    reporte["importancias"] = dict(
        zip(FEATURES, [round(float(v), 4) for v in modelo.feature_importances_])
    )
    return reporte


def main() -> None:
    df = construir_dataset()
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    train = df[df["fecha"] < corte]
    test = df[df["fecha"] >= corte]
    print(f"Train: {len(train)} filas, Test: {len(test)} filas")

    resultado_rf = entrenar_random_forest(train, test)
    resultado_xgb = entrenar_xgboost(train, test)

    reporte = {
        "random_forest": resultado_rf,
        "xgboost": resultado_xgb,
        "fecha_procesamiento_utc": datetime.now(timezone.utc).isoformat(),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reporte_path = OUTPUT_DIR / "random_forest_xgboost_calidad.json"
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    for nombre, r in [("Random Forest", resultado_rf), ("XGBoost", resultado_xgb)]:
        print(f"\n{nombre}: {r['metricas']}")
        print(f"  Cumple metas: {r['cumple_meta']}")
        print(f"  Importancias: {r['importancias']}")
    print(f"\nGuardado en {reporte_path}")


if __name__ == "__main__":
    main()
