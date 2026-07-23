"""Limpia y estandariza el catálogo sísmico de USGS (Bronze -> Silver).

Lee el GeoJSON ya descargado en data/bronze/usgs/local_data/, estandariza tipos y campos, y
valida reglas de calidad. NO asigna todavía cada sismo a una región del Perú: ese join
geoespacial requiere los polígonos de región (shapefile INEI, sección 5.2 del informe), que aún
no se ha descargado como referencia — queda pendiente para antes de o durante Gold, cuando se
construya FACT_MONITOREO_DIARIO (num_sismos_7d, magnitud_max_7d por región).

Uso:
    python limpieza_usgs.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

BRONZE_FILE = (
    Path(__file__).parent.parent.parent
    / "bronze" / "usgs" / "local_data" / "usgs_2012-01-01_2023-12-31.geojson"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

META_COMPLETITUD_MINIMA = 0.98  # sección 11.1 del informe

# Bounding box usado en la ingesta (data/ingestion/usgs/fetch_usgs.py), para descartar en Silver
# los eventos que cayeron justo en países vecinos por ser el bbox un rectángulo, no un polígono.
PERU_BBOX = {"min_lat": -19.0, "max_lat": 0.5, "min_lon": -82.0, "max_lon": -68.0}


def cargar_historico() -> pd.DataFrame:
    if not BRONZE_FILE.exists():
        raise FileNotFoundError(f"No existe {BRONZE_FILE}")
    data = json.loads(BRONZE_FILE.read_text(encoding="utf-8"))

    filas = []
    for feature in data["features"]:
        props = feature["properties"]
        lon, lat, prof = feature["geometry"]["coordinates"]
        filas.append(
            {
                "usgs_id": props.get("code"),
                "fecha_hora_utc": props["time"],
                "magnitud": props.get("mag"),
                "tipo_magnitud": props.get("magType"),
                "lugar": props.get("place"),
                "longitud": lon,
                "latitud": lat,
                "profundidad_km": prof,
            }
        )
    return pd.DataFrame(filas)


def limpiar(df: pd.DataFrame) -> pd.DataFrame:
    df["fecha_hora_utc"] = pd.to_datetime(df["fecha_hora_utc"], unit="ms", utc=True)
    df["fecha"] = df["fecha_hora_utc"].dt.date

    antes = len(df)
    df = df.drop_duplicates(subset="usgs_id")
    duplicados_removidos = antes - len(df)

    # El bbox de ingesta es un rectángulo que roza países vecinos; se descartan aquí los pocos
    # eventos fuera del propio bbox por seguridad (no debería haber ninguno, pero se valida).
    dentro_bbox = (
        df["latitud"].between(PERU_BBOX["min_lat"], PERU_BBOX["max_lat"])
        & df["longitud"].between(PERU_BBOX["min_lon"], PERU_BBOX["max_lon"])
    )
    fuera_de_bbox = int((~dentro_bbox).sum())
    df = df[dentro_bbox]

    df.attrs["duplicados_removidos"] = duplicados_removidos
    df.attrs["fuera_de_bbox_removidos"] = fuera_de_bbox
    return df[
        ["usgs_id", "fecha", "fecha_hora_utc", "magnitud", "tipo_magnitud", "lugar",
         "longitud", "latitud", "profundidad_km"]
    ]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["usgs_id", "fecha", "magnitud", "longitud", "latitud"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": META_COMPLETITUD_MINIMA,
                "valor": round(completitud, 4),
                "ok": bool(completitud >= META_COMPLETITUD_MINIMA),
            }
        )

    magnitud_en_rango = df["magnitud"].between(0, 10).mean()
    resultado["reglas"].append(
        {
            "regla": "magnitud_en_rango_fisico",
            "meta": 1.0,
            "valor": round(magnitud_en_rango, 4),
            "ok": bool(round(magnitud_en_rango, 6) >= 1.0),
        }
    )

    resultado["duplicados_removidos"] = int(df.attrs.get("duplicados_removidos", 0))
    resultado["fuera_de_bbox_removidos"] = int(df.attrs.get("fuera_de_bbox_removidos", 0))
    resultado["nota_pendiente"] = (
        "No incluye aún la asignación de región (join geoespacial contra polígonos INEI, "
        "sección 5.2 del informe) - pendiente de descargar esa referencia."
    )
    resultado["todas_las_reglas_ok"] = all(r["ok"] for r in resultado["reglas"])
    return resultado


def main() -> None:
    df_crudo = cargar_historico()
    print(f"Cargados {len(df_crudo)} eventos crudos.")

    df_limpio = limpiar(df_crudo)
    reporte = validar_calidad(df_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "usgs_sismos_2012_2023.parquet"
    df_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "usgs_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"Registros limpios: {len(df_limpio)} "
        f"(duplicados removidos: {reporte['duplicados_removidos']}, "
        f"fuera de bbox: {reporte['fuera_de_bbox_removidos']})"
    )
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")


if __name__ == "__main__":
    main()
