"""Capa de serving del modelo de riesgo REAL de CENEPRED.

A diferencia de una versión anterior de este archivo (que entrenaba con datos sintéticos
`np.random` y métricas inventadas), esta reutiliza el pipeline real de
`ml/training/random_forest_xgboost.py` como única fuente de verdad:

- Mismas features, mismo target (emergencia MEDIO/ALTO de origen Hidrometeorológico y
  Oceanográfico en los próximos 7 días), mismo split temporal (train 2012-2020 / test
  2021-2023) y mismos hiperparámetros (XGBoost max_depth=3, n_estimators=300, seed 42).
- Las métricas del `model_metadata.json` se CALCULAN sobre el set de test real, no se
  hardcodean. Reproducen F1=0.751 / AUC-ROC=0.860 / recall=0.845 (sección 11.1 del informe).
- La explicabilidad usa SHAP nativo de XGBoost (`pred_contribs=True`, TreeSHAP exacto), no un
  proxy `valor * importancia`.

El modelo real necesita contexto histórico región-día (tasa histórica región-mes, rachas
recientes de 7/14/30/60 días), por eso el serving predice por REGIÓN a partir de su último
estado real disponible en la capa Gold — no a partir de una lectura de telemetría instantánea,
que no basta para construir esas features.
"""

from __future__ import annotations

import json
import pickle
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]
GOLD_DIR = BASE_DIR / "data" / "gold" / "local_data"
TRAINING_DIR = BASE_DIR / "ml" / "training"
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "xgboost_risk_model.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.json"
SNAPSHOT_PATH = MODEL_DIR / "region_features_latest.parquet"

# Reutiliza el pipeline real (features + construcción de dataset + corte temporal).
sys.path.insert(0, str(TRAINING_DIR))
from random_forest_xgboost import FEATURES, construir_dataset  # noqa: E402
from logistic_regression_baseline import FECHA_CORTE_TRAIN_TEST  # noqa: E402

# Umbral de decisión sobre la probabilidad para etiquetar "Riesgo Alto".
UMBRAL_RIESGO = 0.5


def _entrenar(train: pd.DataFrame):
    from xgboost import XGBClassifier

    ratio = (train["label"] == 0).sum() / (train["label"] == 1).sum()
    modelo = XGBClassifier(
        n_estimators=300, max_depth=3, learning_rate=0.05,
        scale_pos_weight=ratio, random_state=42, eval_metric="logloss",
    )
    modelo.fit(train[FEATURES], train["label"])
    return modelo


def train_and_save_model() -> Dict[str, Any]:
    """Entrena el XGBoost real sobre la capa Gold, calcula métricas reales en el test
    temporal y persiste modelo + metadata + snapshot de features por región."""
    from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    df = construir_dataset()
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    train = df[df["fecha"] < corte]
    test = df[df["fecha"] >= corte]

    modelo = _entrenar(train)

    y_pred = modelo.predict(test[FEATURES])
    y_proba = modelo.predict_proba(test[FEATURES])[:, 1]
    metricas = {
        "f1": round(float(f1_score(test["label"], y_pred)), 4),
        "precision": round(float(precision_score(test["label"], y_pred)), 4),
        "recall": round(float(recall_score(test["label"], y_pred)), 4),
        "auc_roc": round(float(roc_auc_score(test["label"], y_proba)), 4),
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(modelo, f)

    # Snapshot: último estado real (features) por región, para servir la predicción por región.
    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet", columns=["region_id", "departamento"])
    ultimo = df.sort_values("fecha").groupby("region_id").tail(1)
    snapshot = ultimo.merge(dim_region, on="region_id", how="left")
    snapshot[["region_id", "departamento", "fecha", *FEATURES]].to_parquet(SNAPSHOT_PATH, index=False)

    metadata = {
        "model_name": "XGBoost_CENEPRED_Riesgo_Hidrometeorologico",
        "version": "2.0.0",
        "descripcion": (
            "Probabilidad de emergencia de severidad MEDIA/ALTA de origen Hidrometeorológico y "
            "Oceanográfico en la región dentro de los próximos 7 días."
        ),
        "features": FEATURES,
        "target": "emergencia_hidromet_medio_alto_7d",
        "umbral_riesgo": UMBRAL_RIESGO,
        "split": {"train": "2012-2020", "test": "2021-2023", "corte": FECHA_CORTE_TRAIN_TEST},
        "metricas_test": metricas,
        "n_train": int(len(train)),
        "n_test": int(len(test)),
        "fecha_entrenamiento_utc": datetime.now(timezone.utc).isoformat(),
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"Modelo real entrenado y guardado en {MODEL_PATH}")
    print(f"Métricas test (2021-2023): {metricas}")
    return metadata


def _cargar_modelo():
    if not MODEL_PATH.exists() or not SNAPSHOT_PATH.exists():
        train_and_save_model()
    with open(MODEL_PATH, "rb") as f:
        modelo = pickle.load(f)
    snapshot = pd.read_parquet(SNAPSHOT_PATH)
    return modelo, snapshot


def _shap_top_drivers(modelo, fila: pd.DataFrame, top_n: int = 3):
    """SHAP nativo exacto de XGBoost (TreeSHAP vía pred_contribs). La última columna es el bias."""
    import xgboost as xgb

    booster = modelo.get_booster()
    dmatrix = xgb.DMatrix(fila[FEATURES], feature_names=FEATURES)
    contribs = booster.predict(dmatrix, pred_contribs=True)[0]  # len = n_features + 1
    pares = list(zip(FEATURES, [float(c) for c in contribs[:-1]]))
    pares.sort(key=lambda x: abs(x[1]), reverse=True)
    return [{"variable": k, "shap_value": round(v, 4)} for k, v in pares[:top_n]]


def predict_risk(departamento: str, fecha: Optional[str] = None) -> Dict[str, Any]:
    """Predice el riesgo hidrometeorológico para una región a partir de su último estado real.

    `fecha` es informativa (fecha del snapshot); el modelo usa el último contexto disponible.
    """
    modelo, snapshot = _cargar_modelo()

    depto = (departamento or "").strip().upper()
    fila = snapshot[snapshot["departamento"].str.upper() == depto]
    if fila.empty:
        disponibles = sorted(snapshot["departamento"].dropna().unique().tolist())
        raise ValueError(f"Departamento '{departamento}' no encontrado. Disponibles: {disponibles}")

    fila = fila.head(1)
    proba = float(modelo.predict_proba(fila[FEATURES])[0, 1])
    es_alto = proba >= UMBRAL_RIESGO

    return {
        "departamento": fila["departamento"].iloc[0],
        "fecha_contexto": str(pd.Timestamp(fila["fecha"].iloc[0]).date()),
        "probabilidad_riesgo_7d": round(proba, 4),
        "nivel_riesgo": "Alto" if es_alto else "Bajo",
        "umbral_decision": UMBRAL_RIESGO,
        "factores_determinantes_shap": _shap_top_drivers(modelo, fila),
    }


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    train_and_save_model()
