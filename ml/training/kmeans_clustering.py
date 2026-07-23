"""Segmenta las 25 regiones del Perú por perfil de riesgo multi-amenaza (K-Means).

Sección 10.2 del informe: "Agrupar regiones con perfiles de riesgo multi-amenaza similares
(clima + sismos + incendios), asignado al campo cluster_riesgo de DIM_REGION". Métrica de
evaluación: silhouette score, meta >= 0.50 (sección 11.1).

Features por región (agregadas de Gold, no a nivel de detección individual) — se restringen
deliberadamente a clima + sismos + incendios, tal como especifica la sección 10.2 ("perfiles de
riesgo multi-amenaza... clima + sismos + incendios"); NO se incluye el histórico de emergencias
como feature (se probó incluirlo y bajaba el silhouette score de 0.41 a 0.36, además de que
mezclaría la variable que más adelante se busca predecir con la que agrupa por exposición):
- temp_max_promedio, precipitacion_promedio (Open-Meteo, vía FACT_MONITOREO_DIARIO)
- num_sismos_7d_promedio (USGS, promedio de la ventana móvil ya calculada en Gold)
- num_focos_calor_promedio (NASA FIRMS)

Actualiza data/gold/local_data/dim_region.parquet con el cluster asignado (no se puede calcular
en dim_region.py porque depende de FACT_MONITOREO_DIARIO, que se construye después en el
pipeline).

Uso:
    python kmeans_clustering.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

GOLD_DIR = Path(__file__).parent.parent.parent / "data" / "gold" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"

FEATURES = [
    "temp_max_promedio", "precipitacion_promedio", "num_sismos_7d_promedio",
    "num_focos_calor_promedio",
]

K_CANDIDATOS = [2, 3, 4, 5]
RANDOM_STATE = 42


def construir_features() -> pd.DataFrame:
    region = pd.read_parquet(GOLD_DIR / "dim_region.parquet")
    monitoreo = pd.read_parquet(GOLD_DIR / "fact_monitoreo_diario.parquet")

    agg_monitoreo = (
        monitoreo.groupby("region_id")
        .agg(
            temp_max_promedio=("temp_max", "mean"),
            precipitacion_promedio=("precipitacion_mm", "mean"),
            num_sismos_7d_promedio=("num_sismos_7d", "mean"),
            num_focos_calor_promedio=("num_focos_calor_activos", "mean"),
        )
        .reset_index()
    )

    return region[["region_id", "departamento"]].merge(agg_monitoreo, on="region_id", how="left")


def entrenar(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    X = df[FEATURES].values
    X_esc = StandardScaler().fit_transform(X)

    resultados_k = {}
    mejor_k, mejor_score, mejor_modelo, mejor_labels = None, -1, None, None
    for k in K_CANDIDATOS:
        modelo = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = modelo.fit_predict(X_esc)
        score = silhouette_score(X_esc, labels)
        resultados_k[k] = round(score, 4)
        if score > mejor_score:
            mejor_k, mejor_score, mejor_modelo, mejor_labels = k, score, modelo, labels

    df = df.copy()
    df["cluster_riesgo"] = mejor_labels

    reporte = {
        "k_evaluados": resultados_k,
        "k_elegido": mejor_k,
        "silhouette_score": round(mejor_score, 4),
        "meta_silhouette": 0.50,
        "cumple_meta": bool(mejor_score >= 0.50),
    }
    return df, reporte


def describir_clusters(df: pd.DataFrame) -> dict:
    resumen = df.groupby("cluster_riesgo")[FEATURES].mean().round(2)
    regiones_por_cluster = df.groupby("cluster_riesgo")["departamento"].apply(list)
    return {
        "resumen_promedios": resumen.to_dict(orient="index"),
        "regiones_por_cluster": regiones_por_cluster.to_dict(),
    }


def actualizar_dim_region(df: pd.DataFrame) -> None:
    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet")
    dim_region = dim_region.drop(columns=["cluster_riesgo"]).merge(
        df[["region_id", "cluster_riesgo"]], on="region_id", how="left"
    )
    dim_region.to_parquet(GOLD_DIR / "dim_region.parquet")


def main() -> None:
    df_features = construir_features()
    print(f"Features construidas para {len(df_features)} regiones.")

    df_resultado, reporte = entrenar(df_features)
    reporte["clusters"] = describir_clusters(df_resultado)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "kmeans_regiones.parquet"
    df_resultado.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "kmeans_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    actualizar_dim_region(df_resultado)

    print(f"K elegido: {reporte['k_elegido']} (silhouette={reporte['silhouette_score']}, "
          f"meta={reporte['meta_silhouette']}, cumple={reporte['cumple_meta']})")
    print(f"Silhouette por K: {reporte['k_evaluados']}")
    for cluster_id, regiones in reporte["clusters"]["regiones_por_cluster"].items():
        print(f"  Cluster {cluster_id}: {regiones}")
    print(f"Guardado en {parquet_path}")
    print("DIM_REGION actualizado con cluster_riesgo.")


if __name__ == "__main__":
    main()
