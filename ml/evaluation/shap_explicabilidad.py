"""Explicabilidad del modelo de clasificación principal — SHAP (sección 10.3 del informe).

"Se incorporan valores SHAP sobre el modelo de clasificación principal para explicar, por región
y por predicción individual, qué variables explican en mayor medida el nivel de riesgo estimado
[...] Esto permite que el resultado del modelo sea interpretable para un usuario no técnico, y no
una 'caja negra'."

Reentrena el mismo XGBoost de ml/training/random_forest_xgboost.py (mismos datos, mismas
features, mismos hiperparámetros) y calcula SHAP sobre el set de test, con 3 niveles de detalle:
1. Importancia global (promedio de |SHAP| por feature) — qué variables explican el riesgo en
   general.
2. Importancia por región — las mismas variables no necesariamente pesan igual en todas las
   regiones (ej. el ONI probablemente explica más en regiones costeras que en la sierra).
3. Explicación de predicciones individuales — el desglose por feature de casos concretos (una
   predicción de alto riesgo bien clasificada, y una emergencia real que el modelo no capturó),
   que es lo que consumiría el chatbot (sección 10.4) para responder "¿por qué está en riesgo
   esta región?".

Uso:
    python shap_explicabilidad.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import shap
from xgboost import XGBClassifier

sys.path.insert(0, str(Path(__file__).parent.parent / "training"))
from logistic_regression_baseline import FECHA_CORTE_TRAIN_TEST  # noqa: E402
from random_forest_xgboost import FEATURES, construir_dataset  # noqa: E402

OUTPUT_DIR = Path(__file__).parent / "local_data"


def entrenar_modelo(train: pd.DataFrame) -> XGBClassifier:
    ratio = (train["label"] == 0).sum() / (train["label"] == 1).sum()
    modelo = XGBClassifier(
        n_estimators=300, max_depth=3, learning_rate=0.05,
        scale_pos_weight=ratio, random_state=42, eval_metric="logloss",
    )
    modelo.fit(train[FEATURES], train["label"])
    return modelo


def importancia_global(shap_values: np.ndarray) -> dict:
    importancia = np.abs(shap_values).mean(axis=0)
    orden = np.argsort(importancia)[::-1]
    return {FEATURES[i]: round(float(importancia[i]), 4) for i in orden}


def importancia_por_region(shap_values: np.ndarray, test: pd.DataFrame, region: pd.DataFrame) -> dict:
    df_shap = pd.DataFrame(shap_values, columns=FEATURES)
    df_shap["region_id"] = test["region_id"].values
    resultado = {}
    for region_id, grupo in df_shap.groupby("region_id"):
        importancia = grupo[FEATURES].abs().mean().sort_values(ascending=False)
        departamento = region.loc[region["region_id"] == region_id, "departamento"].iloc[0]
        resultado[departamento] = {
            "feature_mas_importante": importancia.index[0],
            "top_3": {k: round(float(v), 4) for k, v in importancia.head(3).items()},
        }
    return resultado


def explicar_casos_individuales(
    modelo: XGBClassifier, shap_values: np.ndarray, test: pd.DataFrame, region: pd.DataFrame
) -> dict:
    test = test.reset_index(drop=True)
    proba = modelo.predict_proba(test[FEATURES])[:, 1]

    casos = {}

    # Caso 1: predicción de riesgo alto, acertada (verdadero positivo con mayor confianza).
    verdaderos_positivos = test.index[(test["label"] == 1) & (proba >= 0.5)]
    if len(verdaderos_positivos) > 0:
        idx = verdaderos_positivos[np.argmax(proba[verdaderos_positivos])]
        casos["prediccion_alto_riesgo_acertada"] = _describir_caso(idx, test, proba, shap_values, region)

    # Caso 2: emergencia real que el modelo NO anticipó (falso negativo) — igual de importante
    # de mostrar para ser honestos sobre las limitaciones del modelo.
    falsos_negativos = test.index[(test["label"] == 1) & (proba < 0.5)]
    if len(falsos_negativos) > 0:
        idx = falsos_negativos[np.argmin(proba[falsos_negativos])]
        casos["emergencia_no_anticipada"] = _describir_caso(idx, test, proba, shap_values, region)

    return casos


def _describir_caso(idx, test, proba, shap_values, region) -> dict:
    departamento = region.loc[region["region_id"] == test.loc[idx, "region_id"], "departamento"].iloc[0]
    contribuciones = dict(zip(FEATURES, [round(float(v), 4) for v in shap_values[idx]]))
    contribuciones_ordenadas = dict(
        sorted(contribuciones.items(), key=lambda kv: abs(kv[1]), reverse=True)
    )
    return {
        "region": departamento,
        "fecha": str(test.loc[idx, "fecha"].date()),
        "probabilidad_predicha": round(float(proba[idx]), 4),
        "label_real": int(test.loc[idx, "label"]),
        "valores_features": {f: round(float(test.loc[idx, f]), 2) for f in FEATURES},
        "contribucion_shap_por_feature": contribuciones_ordenadas,
    }


def main() -> None:
    df = construir_dataset()
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    train = df[df["fecha"] < corte]
    test = df[df["fecha"] >= corte].reset_index(drop=True)
    region = pd.read_parquet(
        Path(__file__).parent.parent.parent / "data" / "gold" / "local_data" / "dim_region.parquet"
    )[["region_id", "departamento"]]

    print("Entrenando XGBoost (mismo modelo que random_forest_xgboost.py)...")
    modelo = entrenar_modelo(train)

    print("Calculando valores SHAP sobre el set de test...")
    explainer = shap.TreeExplainer(modelo)
    shap_values = explainer.shap_values(test[FEATURES])

    reporte = {
        "importancia_global": importancia_global(shap_values),
        "importancia_por_region": importancia_por_region(shap_values, test, region),
        "casos_individuales": explicar_casos_individuales(modelo, shap_values, test, region),
        "fecha_procesamiento_utc": datetime.now(timezone.utc).isoformat(),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reporte_path = OUTPUT_DIR / "shap_explicabilidad.json"
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\nImportancia global (top 5):")
    for feat, val in list(reporte["importancia_global"].items())[:5]:
        print(f"  {feat}: {val}")

    print("\nEjemplo por región (3 primeras):")
    for depto, info in list(reporte["importancia_por_region"].items())[:3]:
        print(f"  {depto}: {info['feature_mas_importante']}")

    print(f"\nGuardado en {reporte_path}")


if __name__ == "__main__":
    main()
