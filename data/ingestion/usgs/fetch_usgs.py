"""Descarga el catálogo sísmico de USGS para el territorio peruano hacia Bronze.

Usa la API FDSN Event de USGS (earthquake.usgs.gov), filtrando por el bounding box de Perú.
Se verificó vía el endpoint /count que el volumen total de la ventana 2012-2023 (~3600 eventos)
está muy por debajo del límite de 20,000 resultados por petición de la API, así que no se
necesita paginar ni filtrar por magnitud mínima.

Uso local (antes de tener Azure Functions desplegado):
    python fetch_usgs.py [--start 2012-01-01] [--end 2023-12-31]

Escribe la respuesta cruda (GeoJSON) en ../../bronze/usgs/local_data/ (ignorado por git,
representa localmente el contenedor /bronze/sismos de ADLS Gen2), junto con un manifiesto de
metadatos de ingesta. Cuando exista la infraestructura de Azure (infra/), la función
`download_sismos` es el punto de reemplazo para escribir a ADLS Gen2 /bronze/sismos en vez de
disco local.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import requests

QUERY_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
COUNT_URL = "https://earthquake.usgs.gov/fdsnws/event/1/count"

# Bounding box que cubre el territorio continental del Perú.
PERU_BBOX = {
    "minlatitude": -19.0,
    "maxlatitude": 0.5,
    "minlongitude": -82.0,
    "maxlongitude": -68.0,
}

# Límite de resultados por petición de la API FDSN Event.
MAX_RESULTS_PER_REQUEST = 20_000

# Ventana de datos definida en la sección 2.4 del informe (misma que INDECI y Open-Meteo).
DEFAULT_START = "2012-01-01"
DEFAULT_END = "2023-12-31"

OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "usgs" / "local_data"


def count_eventos(start_date: str, end_date: str) -> int:
    params = {"format": "text", "starttime": start_date, "endtime": end_date, **PERU_BBOX}
    response = requests.get(COUNT_URL, params=params, timeout=30)
    response.raise_for_status()
    return int(response.text.strip())


def download_sismos(start_date: str, end_date: str, output_dir: Path = OUTPUT_DIR) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / f"usgs_{start_date}_{end_date}.geojson"
    if dest_path.exists() and dest_path.stat().st_size > 1024:
        print(f"OK (existente) -> {dest_path}")
        return dest_path

    total = count_eventos(start_date, end_date)
    if total > MAX_RESULTS_PER_REQUEST:
        raise RuntimeError(
            f"La ventana {start_date}..{end_date} tiene {total} eventos, supera el límite de "
            f"{MAX_RESULTS_PER_REQUEST} por petición; hay que particionar por sub-rango de fechas."
        )

    params = {
        "format": "geojson",
        "starttime": start_date,
        "endtime": end_date,
        "orderby": "time",
        **PERU_BBOX,
    }
    response = requests.get(QUERY_URL, params=params, timeout=60)
    response.raise_for_status()
    data = response.json()

    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / f"usgs_{start_date}_{end_date}.geojson"
    dest_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    manifest_path = output_dir / f"usgs_{start_date}_{end_date}.manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "USGS Earthquake Catalog (earthquake.usgs.gov)",
                "start_date": start_date,
                "end_date": end_date,
                "bbox": PERU_BBOX,
                "num_eventos": len(data.get("features", [])),
                "fecha_descarga_utc": datetime.now(timezone.utc).isoformat(),
                "archivo_local": dest_path.name,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return dest_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", default=DEFAULT_START, help="Fecha inicial (YYYY-MM-DD)")
    parser.add_argument("--end", default=DEFAULT_END, help="Fecha final (YYYY-MM-DD)")
    args = parser.parse_args()

    dest_path = download_sismos(args.start, args.end)
    print(f"OK -> {dest_path}")


if __name__ == "__main__":
    main()
