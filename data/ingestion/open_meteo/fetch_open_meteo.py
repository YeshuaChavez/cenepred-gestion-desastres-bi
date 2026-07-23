"""Descarga clima histórico diario (Open-Meteo) para las 25 regiones del Perú hacia Bronze.

Usa la API de archivo histórico de Open-Meteo (ERA5, sin necesidad de API key para uso no
comercial), consultando las 25 regiones en una sola petición batched (Open-Meteo acepta listas
de lat/lon separadas por coma). Los puntos de cada región son la capital de su departamento,
resueltos previamente en regiones_coordenadas.json (ver geocode_regiones.py).

Uso local (antes de tener Azure Functions desplegado):
    python fetch_open_meteo.py [--start 2012-01-01] [--end 2023-12-31]

Escribe la respuesta cruda en ../../bronze/open_meteo/local_data/ (ignorado por git, representa
localmente el contenedor /bronze/clima de ADLS Gen2), junto con un manifiesto de metadatos de
ingesta. Cuando exista la infraestructura de Azure (infra/), la función `download_clima` es el
punto de reemplazo para escribir a ADLS Gen2 /bronze/clima en vez de disco local.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import requests

ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive"
DAILY_VARIABLES = "temperature_2m_max,temperature_2m_min,precipitation_sum"
TIMEZONE = "America/Lima"

COORDENADAS_PATH = Path(__file__).parent / "regiones_coordenadas.json"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "open_meteo" / "local_data"

# Ventana de datos definida en la sección 2.4 del informe (misma que INDECI, para poder cruzar).
DEFAULT_START = "2012-01-01"
DEFAULT_END = "2023-12-31"


def load_regiones() -> list[dict]:
    if not COORDENADAS_PATH.exists():
        raise FileNotFoundError(
            f"No existe {COORDENADAS_PATH}. Corre primero: python geocode_regiones.py"
        )
    return json.loads(COORDENADAS_PATH.read_text(encoding="utf-8"))


def download_clima(start_date: str, end_date: str, output_dir: Path = OUTPUT_DIR) -> Path:
    regiones = load_regiones()

    params = {
        "latitude": ",".join(str(r["latitud"]) for r in regiones),
        "longitude": ",".join(str(r["longitud"]) for r in regiones),
        "start_date": start_date,
        "end_date": end_date,
        "daily": DAILY_VARIABLES,
        "timezone": TIMEZONE,
    }
    response = requests.get(ARCHIVE_API_URL, params=params, timeout=120)
    response.raise_for_status()
    resultados = response.json()

    # La API no siempre incluye "location_id" en el primer elemento (es implícitamente 0);
    # lo completamos aquí para poder mapear cada resultado a su región por posición.
    for idx, resultado in enumerate(resultados):
        resultado.setdefault("location_id", idx)
        resultado["region"] = regiones[idx]["region"]

    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / f"open_meteo_{start_date}_{end_date}.json"
    dest_path.write_text(json.dumps(resultados, ensure_ascii=False, indent=2), encoding="utf-8")

    manifest_path = output_dir / f"open_meteo_{start_date}_{end_date}.manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "Open-Meteo (archive-api.open-meteo.com)",
                "start_date": start_date,
                "end_date": end_date,
                "num_regiones": len(regiones),
                "variables": DAILY_VARIABLES,
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

    dest_path = download_clima(args.start, args.end)
    print(f"OK -> {dest_path}")


if __name__ == "__main__":
    main()
