"""Capa de serving del modelo de riesgo REAL de CENEPRED.

Diseño autocontenido para inferencia: el serving predice usando SOLO tres artefactos
(modelo `.pkl` + snapshot de features por región + metadata con la lista de features).
No necesita la capa Gold ni el módulo `ml/training` en tiempo de inferencia, de modo que
funciona igual en local, en el contenedor Docker y en un Azure ML Online Endpoint (donde el
modelo se monta en `AZUREML_MODEL_DIR`).

El ENTRENAMIENTO (`train_and_save_model`, offline) sí reutiliza el pipeline real de
`ml/training/random_forest_xgboost.py` como única fuente de verdad — mismas features, mismo
target, mismo split temporal y mismos hiperparámetros — pero se importa de forma perezosa, solo
cuando se entrena, para no acoplar la inferencia.
"""

from __future__ import annotations

import json
import os
import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]
GOLD_DIR = BASE_DIR / "data" / "gold" / "local_data"
TRAINING_DIR = BASE_DIR / "ml" / "training"
MODEL_DIR = Path(__file__).resolve().parent / "models"

MODEL_FILENAME = "xgboost_risk_model.pkl"
METADATA_FILENAME = "model_metadata.json"
SNAPSHOT_FILENAME = "region_features_latest.parquet"

# Umbral de decisión sobre la probabilidad para etiquetar "Riesgo Alto".
UMBRAL_RIESGO = 0.5


def _artifact_dir(model_dir: Optional[str] = None) -> Path:
    """Resuelve dónde están los artefactos del modelo.

    Prioridad: argumento explícito -> AZUREML_MODEL_DIR (Azure ML monta el modelo ahí) ->
    carpeta local data/ml/models.
    """
    if model_dir:
        return Path(model_dir)
    env = os.getenv("AZUREML_MODEL_DIR")
    if env:
        base = Path(env)
        # El modelo puede registrarse como carpeta 'models' o con los archivos en la raíz.
        return base / "models" if (base / "models" / MODEL_FILENAME).exists() else base
    return MODEL_DIR


# --------------------------------------------------------------------------------------------
# ENTRENAMIENTO (offline) — reutiliza el pipeline real; import perezoso de ml/training.
# --------------------------------------------------------------------------------------------
def train_and_save_model() -> Dict[str, Any]:
    import sys

    from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
    from xgboost import XGBClassifier

    sys.path.insert(0, str(TRAINING_DIR))
    from random_forest_xgboost import FEATURES, construir_dataset  # noqa: E402
    from logistic_regression_baseline import FECHA_CORTE_TRAIN_TEST  # noqa: E402

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    df = construir_dataset()
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    train = df[df["fecha"] < corte]
    test = df[df["fecha"] >= corte]

    ratio = (train["label"] == 0).sum() / (train["label"] == 1).sum()
    modelo = XGBClassifier(
        n_estimators=300, max_depth=3, learning_rate=0.05,
        scale_pos_weight=ratio, random_state=42, eval_metric="logloss",
    )
    modelo.fit(train[FEATURES], train["label"])

    y_pred = modelo.predict(test[FEATURES])
    y_proba = modelo.predict_proba(test[FEATURES])[:, 1]
    metricas = {
        "f1": round(float(f1_score(test["label"], y_pred)), 4),
        "precision": round(float(precision_score(test["label"], y_pred)), 4),
        "recall": round(float(recall_score(test["label"], y_pred)), 4),
        "auc_roc": round(float(roc_auc_score(test["label"], y_proba)), 4),
    }

    with open(MODEL_DIR / MODEL_FILENAME, "wb") as f:
        pickle.dump(modelo, f)

    # Snapshot: último estado real (features) por región, para servir la predicción por región.
    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet", columns=["region_id", "departamento"])
    ultimo = df.sort_values("fecha").groupby("region_id").tail(1)
    snapshot = ultimo.merge(dim_region, on="region_id", how="left")
    snapshot[["region_id", "departamento", "fecha", *FEATURES]].to_parquet(
        MODEL_DIR / SNAPSHOT_FILENAME, index=False
    )

    metadata = {
        "model_name": "XGBoost_CENEPRED_Riesgo_Hidrometeorologico",
        "version": "2.0.0",
        "descripcion": (
            "Probabilidad de emergencia de severidad MEDIA/ALTA de origen Hidrometeorológico y "
            "Oceanográfico en la región dentro de los próximos 7 días."
        ),
        "features": list(FEATURES),
        "target": "emergencia_hidromet_medio_alto_7d",
        "umbral_riesgo": UMBRAL_RIESGO,
        "split": {"train": "2012-2020", "test": "2021-2023", "corte": FECHA_CORTE_TRAIN_TEST},
        "metricas_test": metricas,
        "n_train": int(len(train)),
        "n_test": int(len(test)),
        "fecha_entrenamiento_utc": datetime.now(timezone.utc).isoformat(),
    }
    with open(MODEL_DIR / METADATA_FILENAME, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"Modelo real entrenado y guardado en {MODEL_DIR / MODEL_FILENAME}")
    print(f"Métricas test (2021-2023): {metricas}")
    return metadata


# --------------------------------------------------------------------------------------------
# INFERENCIA (endpoint) — autocontenida: solo lee los artefactos, sin Gold ni ml/training.
# --------------------------------------------------------------------------------------------
def cargar_artefactos(model_dir: Optional[str] = None) -> Tuple[Any, pd.DataFrame, List[str]]:
    """Carga (modelo, snapshot, features) desde el directorio de artefactos.

    Si faltan y hay capa Gold local disponible, los regenera (comodidad en desarrollo). En el
    endpoint los artefactos siempre están montados, por lo que no se reentrena.
    """
    d = _artifact_dir(model_dir)
    model_path, snap_path, meta_path = d / MODEL_FILENAME, d / SNAPSHOT_FILENAME, d / METADATA_FILENAME

    if not (model_path.exists() and snap_path.exists() and meta_path.exists()):
        if model_dir is None and (GOLD_DIR / "fact_monitoreo_diario.parquet").exists():
            train_and_save_model()
            d = MODEL_DIR
            model_path, snap_path, meta_path = d / MODEL_FILENAME, d / SNAPSHOT_FILENAME, d / METADATA_FILENAME
        else:
            raise FileNotFoundError(
                f"Artefactos del modelo no encontrados en {d}. Ejecuta 'python data/ml/predictive_model.py' "
                "para generarlos, o monta el modelo en AZUREML_MODEL_DIR."
            )

    with open(model_path, "rb") as f:
        modelo = pickle.load(f)
    snapshot = pd.read_parquet(snap_path)
    features = json.loads(meta_path.read_text(encoding="utf-8"))["features"]
    return modelo, snapshot, features


def _shap_top_drivers(modelo, fila: pd.DataFrame, features: List[str], top_n: int = 3):
    """SHAP nativo exacto de XGBoost (TreeSHAP vía pred_contribs). La última columna es el bias."""
    import xgboost as xgb

    booster = modelo.get_booster()
    dmatrix = xgb.DMatrix(fila[features], feature_names=features)
    contribs = booster.predict(dmatrix, pred_contribs=True)[0]  # len = n_features + 1
    pares = list(zip(features, [float(c) for c in contribs[:-1]]))
    pares.sort(key=lambda x: abs(x[1]), reverse=True)
    return [{"variable": k, "shap_value": round(v, 4)} for k, v in pares[:top_n]]


def predecir(modelo, snapshot: pd.DataFrame, features: List[str], departamento: str) -> Dict[str, Any]:
    """Predicción pura sobre artefactos ya cargados (usada por el endpoint sin recargar)."""
    depto = (departamento or "").strip().upper()
    fila = snapshot[snapshot["departamento"].str.upper() == depto]
    if fila.empty:
        disponibles = sorted(snapshot["departamento"].dropna().unique().tolist())
        raise ValueError(f"Departamento '{departamento}' no encontrado. Disponibles: {disponibles}")

    fila = fila.head(1)
    proba = float(modelo.predict_proba(fila[features])[0, 1])
    return {
        "departamento": fila["departamento"].iloc[0],
        "fecha_contexto": str(pd.Timestamp(fila["fecha"].iloc[0]).date()),
        "probabilidad_riesgo_7d": round(proba, 4),
        "nivel_riesgo": "Alto" if proba >= UMBRAL_RIESGO else "Bajo",
        "umbral_decision": UMBRAL_RIESGO,
        "factores_determinantes_shap": _shap_top_drivers(modelo, fila, features),
    }


def predict_risk(departamento: str, fecha: Optional[str] = None, model_dir: Optional[str] = None) -> Dict[str, Any]:
    """Conveniencia: carga artefactos y predice para una región. `fecha` es informativa."""
    modelo, snapshot, features = cargar_artefactos(model_dir)
    return predecir(modelo, snapshot, features, departamento)


if __name__ == "__main__":
    import sys

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    train_and_save_model()
