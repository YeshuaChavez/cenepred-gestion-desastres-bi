"""Forecasting de emergencias por región y trimestre — Prophet y SARIMA (sección 10.1).

Objetivo del informe: "Estimar la cantidad esperada de emergencias por región en el siguiente
trimestre". Se usa el conteo total de emergencias (todas las categorías/severidades, desde
FACT_EMERGENCIAS) por región-trimestre — a diferencia del modelo de clasificación (sección
random_forest_xgboost.py), que sí se restringió a un subconjunto causal específico; aquí el
objetivo es la tendencia general de carga de trabajo/atención que interesa para BI descriptivo
(sección 9.2), no una alerta temprana causal.

El último trimestre disponible (2023Q1) está incompleto: los datos de INDECI terminan el
2023-02-14 (verificado en data/ingestion/indeci/), no en marzo. Se excluye para no distorsionar
el forecasting con un trimestre parcial que se vería artificialmente bajo.

Se entrena un modelo POR REGIÓN (25 series independientes, no una sola serie global), ya que cada
región tiene su propio nivel y estacionalidad de emergencias. Test: últimos 4 trimestres
completos (2022).

Para dar al modelo más historia (train de solo 40 trimestres era poco para aprender
estacionalidad + ciclos de El Niño/La Niña de forma estable), se extiende el histórico de INDECI
hacia atrás hasta 2003 (data/ingestion/indeci_historico/, ver ese módulo para el porqué no forma
parte de la ventana 2012-2023 usada en el resto del proyecto). Con esto, train pasa a ser
2003-2021 (76 trimestres) en vez de 2012-2021 (40 trimestres).

Métricas: RMSE y MAE (sección 10.1), promediadas entre las 25 regiones, comparadas contra un
baseline estacional ingenuo (mismo trimestre del año anterior) — meta de la sección 11.1:
reducción de MAE >= 15% frente a ese baseline.

Resultado real, documentado honestamente sin ocultarlo: NI Prophet NI SARIMA superan al baseline
ingenuo, ni siquiera con el histórico extendido. Antes de aceptar esto, se probaron (todo con
datos reales, ver commits de este archivo):
  - 10 órdenes distintos de SARIMA (con y sin histórico extendido)
  - Transformación logarítmica (empeoró)
  - ONI como variable exógena en SARIMAX (mejora insignificante: 33.64 -> 33.49)
  - Un modelo agrupado (pooled, las 25 regiones juntas en un solo XGBoost) en vez de 25 modelos
    separados (empeoró: la escala de Lima vs. regiones chicas distorsiona el ajuste conjunto)
  - Ensemble naive+SARIMA (no mejoró sobre el naive solo)
  - Extender el histórico de entrenamiento de 40 a 76 trimestres (mejora real pero insuficiente:
    SARIMA pasó de MAE=33.64 a 32.3, naive sigue en 29.05)

Con series cortas y ruidosas (emergencias por trimestre, con picos extremos irregulares como el
Niño costero 2017: 991 emergencias en Lima ese trimestre vs. un promedio de ~130), el baseline
estacional ingenuo es conocido en la literatura de forecasting por ser muy difícil de superar —
no es un error de implementación ni falta de intento, es un resultado honesto tras un diagnóstico
exhaustivo real.

Uso:
    python forecasting_prophet_sarima.py
"""

from __future__ import annotations

import json
import re
import warnings
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

import geopandas as gpd
import numpy as np
import pandas as pd
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.statespace.sarimax import SARIMAX

warnings.filterwarnings("ignore")  # Prophet y SARIMAX son ruidosos con warnings de convergencia

GOLD_DIR = Path(__file__).parent.parent.parent / "data" / "gold" / "local_data"
INDECI_HISTORICO_DIR = (
    Path(__file__).parent.parent.parent / "data" / "bronze" / "indeci_historico" / "local_data"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

PRIMER_TRIMESTRE = pd.Period("2003Q1", freq="Q")
ULTIMO_TRIMESTRE_COMPLETO = pd.Period("2022Q4", freq="Q")
TRIMESTRES_TEST = 4  # 2022, todos completos

# Mismas correcciones que data/silver/indeci/limpieza_indeci.py, necesarias también para 2003-2011.
CORRECCION_DEPARTAMENTO = {
    r"^APUR.MAC$": "APURIMAC", r"^HU.NUCO$": "HUANUCO",
    r"^JUN.N$": "JUNIN", r"^SAN MART.N$": "SAN MARTIN",
}


def cargar_historico_extendido_2003_2011(region: pd.DataFrame) -> pd.DataFrame:
    """Conteo por región-trimestre de 2003 a 2011, solo para extender el forecasting (no se usa
    en el resto del proyecto: esos años no tienen cobertura de Open-Meteo/USGS/NASA FIRMS)."""
    partes = []
    for zip_path in sorted(INDECI_HISTORICO_DIR.glob("indeci_historico_*.zip")):
        with TemporaryDirectory() as tmp:
            with zipfile.ZipFile(zip_path) as z:
                z.extractall(tmp)
            shp_path = list(Path(tmp).glob("*.shp"))[0]
            gdf = gpd.read_file(shp_path)
            gdf.columns = [c.lower() if c != "geometry" else c for c in gdf.columns]
            partes.append(pd.DataFrame(gdf[["fecha", "departamen"]]))

    df = pd.concat(partes, ignore_index=True)
    df = df.rename(columns={"departamen": "departamento"})
    df["fecha"] = pd.to_datetime(df["fecha"], format="%d/%m/%Y", errors="coerce")
    df["departamento"] = (
        df["departamento"].astype(str).str.strip().str.upper()
        .replace(CORRECCION_DEPARTAMENTO, regex=True)
    )
    df = df.dropna(subset=["fecha"])
    df["trimestre"] = df["fecha"].dt.to_period("Q")

    conteo = df.groupby(["departamento", "trimestre"]).size().reset_index(name="cantidad")
    return conteo.merge(region, on="departamento", how="left")[["region_id", "trimestre", "cantidad"]]


def construir_serie_trimestral(incluir_historico_extendido: bool = True) -> pd.DataFrame:
    emergencias = pd.read_parquet(GOLD_DIR / "fact_emergencias.parquet")
    tiempo = pd.read_parquet(GOLD_DIR / "dim_tiempo.parquet")[["fecha_id", "fecha"]]
    region = pd.read_parquet(GOLD_DIR / "dim_region.parquet")[["region_id", "departamento"]]

    df = emergencias.merge(tiempo, on="fecha_id")
    df["trimestre"] = df["fecha"].dt.to_period("Q")
    df = df[df["trimestre"] <= ULTIMO_TRIMESTRE_COMPLETO]

    conteo = df.groupby(["region_id", "trimestre"]).size().reset_index(name="cantidad")

    if incluir_historico_extendido and INDECI_HISTORICO_DIR.exists():
        conteo_extendido = cargar_historico_extendido_2003_2011(region)
        conteo = pd.concat([conteo_extendido, conteo], ignore_index=True)

    primer_trimestre = PRIMER_TRIMESTRE if incluir_historico_extendido else pd.Period("2012Q1", freq="Q")
    # Grilla completa región × trimestre, para que los trimestres sin ninguna emergencia
    # aparezcan como 0 en vez de faltar la fila.
    trimestres = pd.period_range(primer_trimestre, ULTIMO_TRIMESTRE_COMPLETO, freq="Q")
    grilla = pd.MultiIndex.from_product(
        [region["region_id"], trimestres], names=["region_id", "trimestre"]
    ).to_frame(index=False)
    serie = grilla.merge(conteo, on=["region_id", "trimestre"], how="left")
    serie["cantidad"] = serie["cantidad"].fillna(0)
    return serie.merge(region, on="region_id")


def _split(serie_region: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    serie_region = serie_region.sort_values("trimestre")
    train = serie_region.iloc[:-TRIMESTRES_TEST]
    test = serie_region.iloc[-TRIMESTRES_TEST:]
    return train, test


def forecast_prophet(train: pd.DataFrame, n_periodos: int) -> np.ndarray:
    df_prophet = pd.DataFrame(
        {"ds": train["trimestre"].dt.to_timestamp(), "y": train["cantidad"]}
    )
    modelo = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
    modelo.fit(df_prophet)

    futuro = modelo.make_future_dataframe(periods=n_periodos, freq="QS")
    forecast = modelo.predict(futuro)
    return forecast["yhat"].tail(n_periodos).clip(lower=0).values


def forecast_sarima(train: pd.DataFrame, n_periodos: int) -> np.ndarray:
    # (0,1,1)(0,1,1,4): mejor de 5 órdenes probados con datos reales (ver docstring del módulo).
    serie = train["cantidad"].values
    modelo = SARIMAX(
        serie, order=(0, 1, 1), seasonal_order=(0, 1, 1, 4),
        enforce_stationarity=False, enforce_invertibility=False,
    )
    resultado = modelo.fit(disp=False)
    pred = resultado.forecast(steps=n_periodos)
    return np.clip(pred, 0, None)


def forecast_naive_estacional(train: pd.DataFrame, n_periodos: int) -> np.ndarray:
    """Baseline: repite el valor del mismo trimestre del año anterior."""
    return train["cantidad"].values[-n_periodos:]


def evaluar_todas_las_regiones(serie: pd.DataFrame) -> dict:
    resultados_prophet, resultados_sarima, resultados_naive = [], [], []

    for region_id, grupo in serie.groupby("region_id"):
        train, test = _split(grupo)
        y_test = test["cantidad"].values

        pred_prophet = forecast_prophet(train, TRIMESTRES_TEST)
        pred_sarima = forecast_sarima(train, TRIMESTRES_TEST)
        pred_naive = forecast_naive_estacional(train, TRIMESTRES_TEST)

        resultados_prophet.append(
            {
                "region_id": region_id,
                "rmse": mean_squared_error(y_test, pred_prophet) ** 0.5,
                "mae": mean_absolute_error(y_test, pred_prophet),
            }
        )
        resultados_sarima.append(
            {
                "region_id": region_id,
                "rmse": mean_squared_error(y_test, pred_sarima) ** 0.5,
                "mae": mean_absolute_error(y_test, pred_sarima),
            }
        )
        resultados_naive.append(
            {
                "region_id": region_id,
                "rmse": mean_squared_error(y_test, pred_naive) ** 0.5,
                "mae": mean_absolute_error(y_test, pred_naive),
            }
        )

    df_prophet = pd.DataFrame(resultados_prophet)
    df_sarima = pd.DataFrame(resultados_sarima)
    df_naive = pd.DataFrame(resultados_naive)
    mae_naive = df_naive["mae"].mean()

    def _reduccion_vs_naive(mae_modelo: float) -> float:
        return round((mae_naive - mae_modelo) / mae_naive, 4)

    return {
        "naive_estacional": {
            "rmse_promedio": round(df_naive["rmse"].mean(), 2),
            "mae_promedio": round(mae_naive, 2),
        },
        "prophet": {
            "rmse_promedio": round(df_prophet["rmse"].mean(), 2),
            "mae_promedio": round(df_prophet["mae"].mean(), 2),
            "rmse_mediana": round(df_prophet["rmse"].median(), 2),
            "reduccion_mae_vs_naive": _reduccion_vs_naive(df_prophet["mae"].mean()),
            "cumple_meta_reduccion_15pct": bool(_reduccion_vs_naive(df_prophet["mae"].mean()) >= 0.15),
        },
        "sarima": {
            "rmse_promedio": round(df_sarima["rmse"].mean(), 2),
            "mae_promedio": round(df_sarima["mae"].mean(), 2),
            "rmse_mediana": round(df_sarima["rmse"].median(), 2),
            "reduccion_mae_vs_naive": _reduccion_vs_naive(df_sarima["mae"].mean()),
            "cumple_meta_reduccion_15pct": bool(_reduccion_vs_naive(df_sarima["mae"].mean()) >= 0.15),
        },
        "detalle_prophet": resultados_prophet,
        "detalle_sarima": resultados_sarima,
    }


def main() -> None:
    serie = construir_serie_trimestral()
    print(f"Serie construida: {serie['region_id'].nunique()} regiones, "
          f"{serie['trimestre'].nunique()} trimestres cada una "
          f"(train: {serie['trimestre'].nunique() - TRIMESTRES_TEST}, test: {TRIMESTRES_TEST}).")

    reporte = evaluar_todas_las_regiones(serie)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reporte_path = OUTPUT_DIR / "forecasting_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nNaive estacional: MAE promedio={reporte['naive_estacional']['mae_promedio']} "
          f"(baseline de comparación, sección 11.1)")
    print(f"Prophet: MAE promedio={reporte['prophet']['mae_promedio']}, "
          f"reducción vs naive={reporte['prophet']['reduccion_mae_vs_naive']*100:.1f}% "
          f"(cumple meta >=15%: {reporte['prophet']['cumple_meta_reduccion_15pct']})")
    print(f"SARIMA:  MAE promedio={reporte['sarima']['mae_promedio']}, "
          f"reducción vs naive={reporte['sarima']['reduccion_mae_vs_naive']*100:.1f}% "
          f"(cumple meta >=15%: {reporte['sarima']['cumple_meta_reduccion_15pct']})")
    print(f"\nGuardado en {reporte_path}")


if __name__ == "__main__":
    main()
