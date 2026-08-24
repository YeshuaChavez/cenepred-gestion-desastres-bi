"""Exporta el modelo XGBoost entrenado (data/ml/models) a assets del webapp para inferencia
en el navegador, SIN dependencias pesadas:

- apps/webapp/public/model/xgb_model.json : el ensamble de árboles (dump JSON de xgboost) +
  base_margin y la lista de features. Se evalúa en el cliente (src/lib/xgbModel.ts) reproduciendo
  exactamente la salida de xgboost (binary:logistic): prob = sigmoid(base_margin + Σ hojas).
- apps/webapp/src/data/regionFeatures.json : el vector real de las 14 features por departamento
  (region_features_latest), que sirve de contexto base para el simulador "¿qué pasaría si...?".

Requiere los artefactos del modelo (ejecutar antes `python data/ml/predictive_model.py`).

Uso:
    python scripts/export_model_to_webapp.py
"""

from __future__ import annotations

import json
import math
import pickle
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "data" / "ml" / "models"
PUBLIC_MODEL = ROOT / "apps" / "webapp" / "public" / "model" / "xgb_model.json"
REGION_FEATURES = ROOT / "apps" / "webapp" / "src" / "data" / "regionFeatures.json"


def main() -> None:
    model = pickle.loads((MODEL_DIR / "xgboost_risk_model.pkl").read_bytes())
    booster = model.get_booster()
    trees = [json.loads(t) for t in booster.get_dump(dump_format="json")]

    meta = json.loads((MODEL_DIR / "model_metadata.json").read_text(encoding="utf-8"))
    features = meta["features"]

    cfg = json.loads(booster.save_config())
    base_score = float(re.sub(r"[\[\]]", "", str(cfg["learner"]["learner_model_param"]["base_score"])))
    base_margin = math.log(base_score / (1 - base_score)) if 0 < base_score < 1 else 0.0

    PUBLIC_MODEL.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_MODEL.write_text(json.dumps({
        "objective": "binary:logistic",
        "base_margin": base_margin,
        "features": features,
        "metrics": meta["metricas_test"],
        "trees": trees,
    }, separators=(",", ":")), encoding="utf-8")

    snap = pd.read_parquet(MODEL_DIR / "region_features_latest.parquet")
    region_feats = {
        str(r["departamento"]).upper(): {
            f: (None if pd.isna(r[f]) else round(float(r[f]), 4)) for f in features
        }
        for _, r in snap.iterrows()
    }
    REGION_FEATURES.write_text(json.dumps(region_feats, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"xgb_model.json: {len(trees)} árboles, {round(PUBLIC_MODEL.stat().st_size / 1024, 1)} KB")
    print(f"regionFeatures.json: {len(region_feats)} departamentos")


if __name__ == "__main__":
    main()
