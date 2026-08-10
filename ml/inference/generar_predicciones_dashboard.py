"""Exporta las predicciones del XGBoost principal (ml/training/random_forest_xgboost.py) para
que el dashboard 9.3 (Riesgo Dinámico y Explicabilidad) las pueda consultar en Power BI.

Los scripts de entrenamiento no persisten el modelo entrenado ni las predicciones fila por fila
(solo el reporte de métricas agregadas en random_forest_xgboost_calidad.json) — esto reentrena el
mismo XGBoost, con los mismos hiperparámetros y random_state=42, así que reproduce exactamente el
mismo modelo, y guarda la probabilidad predicha por cada fila del set de test (2021-2023, el mismo
periodo sobre el que se reportan F1=0.751 / AUC=0.860 / recall=0.845).

Uso:
    python generar_predicciones_dashboard.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent / "training"))
from logistic_regression_baseline import FECHA_CORTE_TRAIN_TEST  # noqa: E402
from random_forest_xgboost import FEATURES, construir_dataset  # noqa: E402

GOLD_DIR = Path(__file__).parent.parent.parent / "data" / "gold" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"


def generar() -> pd.DataFrame:
    df = construir_dataset()
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    train = df[df["fecha"] < corte].copy()
    test = df[df["fecha"] >= corte].copy()

    from xgboost import XGBClassifier

    ratio = (train["label"] == 0).sum() / (train["label"] == 1).sum()
    modelo = XGBClassifier(
        n_estimators=300, max_depth=3, learning_rate=0.05,
        scale_pos_weight=ratio, random_state=42, eval_metric="logloss",
    )
    modelo.fit(train[FEATURES], train["label"])
    test["probabilidad_predicha"] = modelo.predict_proba(test[FEATURES])[:, 1]

    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet", columns=["region_id", "departamento"])
    resultado = test.merge(dim_region, on="region_id", how="left")
    resultado = resultado.rename(columns={"label": "label_real"})

    return resultado[["region_id", "departamento", "fecha", "probabilidad_predicha", "label_real"]]


def main() -> None:
    resultado = generar()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "predicciones_xgboost.parquet"
    resultado.to_parquet(parquet_path, index=False)
    print(f"Predicciones generadas: {len(resultado)} filas ({resultado['fecha'].min()} a {resultado['fecha'].max()})")
    print(f"Guardado en {parquet_path}")


if __name__ == "__main__":
    main()
