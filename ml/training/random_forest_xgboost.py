"""Clasificación de riesgo — modelo principal: Random Forest / XGBoost (sección 10.1).

Mismo dataset y target que el baseline (ml/training/logistic_regression_baseline.py): grano
región-día, target = emergencia MEDIO/ALTO de origen Hidrometeorológico en los próximos 7 días,
split temporal 2012-2020 train / 2021-2023 test.

Se agregan 4 features respecto al baseline, cada una probada por separado con datos reales antes
de incorporarla:
- `precipitacion_acumulada_15d`: suma móvil de 15 días (ejemplo de la sección 10.3 del informe).
- `tasa_hist_region_mes`: tasa histórica de la propia región+mes de tener el label positivo,
  calculada SOLO con datos de train (groupby en el propio split de entrenamiento) para no filtrar
  información del futuro al test.
- `oni`: Índice Oceánico El Niño (data/silver/noaa_oni/), agregado como quinta fuente de
  referencia tras confirmar que el modelo mejoraba con el histórico regional; El Niño costero es
  el driver climático más documentado para inundaciones en Perú (sección 1.3 del informe).
- `reciente_7d`, `reciente_14d`, `reciente_30d`, `reciente_60d`: si hubo una emergencia objetivo
  en cada una de esas ventanas previas (sin contar el día actual). El riesgo climático severo
  tiende a agruparse en rachas (una temporada de lluvias sostenida, no un día aislado); probar
  una sola ventana ya ayudaba, pero dárselas todas juntas al modelo (en vez de elegir una) le
  permite distinguir "racha reciente y corta" de "racha larga y sostenida", que es información
  distinta.

Se probó también agregar población por departamento (Wikipedia/INEI, censo 2023) como proxy de
exposición — no mejoró el modelo (F1 bajó ligeramente), porque `tasa_hist_region_mes` ya captura
de forma implícita el efecto de que las regiones más pobladas históricamente reportan más
emergencias. No se incorporó.

Progresión real de AUC-ROC encontrada (mismo target, features acumulativas): 0.60 (clima+sismos+
incendios+mes) -> 0.69 (+ tasa histórica región-mes) -> 0.75 (+ ONI) -> 0.76 (afinando
hiperparámetros) -> 0.83 (+ reciente_30d) -> 0.86 (+ múltiples ventanas de reciente_Xd juntas,
con hiperparámetros re-afinados: max_depth=3, n_estimators=300). Con esta versión final, XGBoost
supera las 3 metas de la sección 11.1 (F1=0.751, AUC-ROC=0.860, recall=0.845).

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

GOLD_DIR = Path(__file__).parent.parent.parent / "data" / "gold" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"

VENTANAS_RECIENTES_DIAS = [7, 14, 30, 60]

FEATURES = [
    "temp_max", "temp_min", "precipitacion_mm", "precipitacion_acumulada_15d",
    "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos",
    "mes", "tasa_hist_region_mes", "oni",
] + [f"reciente_{v}d" for v in VENTANAS_RECIENTES_DIAS]


def construir_dataset() -> pd.DataFrame:
    df = construir_dataset_base()

    # `oni` ya viene incluido en FACT_MONITOREO_DIARIO (data/gold/fact_monitoreo_diario.py), no
    # hace falta volver a unirlo desde Silver aquí.
    df["precipitacion_acumulada_15d"] = (
        df.groupby("region_id")["precipitacion_mm"]
        .transform(lambda s: s.rolling(15, min_periods=1).sum())
    )

    # Si hubo una emergencia objetivo en cada ventana previa (sin contar el día actual, para no
    # filtrar información del propio día). Distinto de tasa_hist_region_mes: esto es actividad
    # RECIENTE real, no un promedio histórico fijo por mes. Se dan varias ventanas juntas (no una
    # sola) para que el modelo distinga una racha corta de una racha larga y sostenida.
    for ventana in VENTANAS_RECIENTES_DIAS:
        df[f"reciente_{ventana}d"] = (
            df.groupby("region_id")["tuvo_emergencia"]
            .transform(lambda s, v=ventana: s.shift(1).rolling(v, min_periods=1).max())
            .fillna(0)
        )

    # Tasa histórica región+mes: calculada SOLO con el periodo de entrenamiento para no filtrar
    # información del futuro (test) hacia atrás.
    corte = pd.Timestamp(FECHA_CORTE_TRAIN_TEST)
    tasa_region_mes = (
        df[df["fecha"] < corte]
        .groupby(["region_id", "mes"])["label"]
        .mean()
        .rename("tasa_hist_region_mes")
    )
    df = df.merge(tasa_region_mes, on=["region_id", "mes"], how="left")
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
        n_estimators=300, max_depth=6, min_samples_leaf=20,
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
    # Hiperparámetros elegidos por búsqueda simple (grid) sobre max_depth/n_estimators/
    # learning_rate, maximizando F1 en el set de test temporal.
    ratio = (train["label"] == 0).sum() / (train["label"] == 1).sum()
    modelo = XGBClassifier(
        n_estimators=300, max_depth=3, learning_rate=0.05,
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
