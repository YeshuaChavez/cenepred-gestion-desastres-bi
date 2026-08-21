"""Descarga clima histórico diario (Open-Meteo) para las 25 regiones del Perú hacia Bronze.

Usa la API de archivo histórico de Open-Meteo (ERA5, sin necesidad de API key para uso no
comercial), consultando las 25 regiones en peticiones batched. Los puntos de cada región son la capital de su departamento,
resueltos previamente en regiones_coordenadas.json (ver geocode_regiones.py).
"""

from __future__ import annotations

import argparse
import json
import time
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


def download_clima(start_date: str, end_date: str, output_dir: Path = OUTPUT_DIR, force: bool = False) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / f"open_meteo_{start_date}_{end_date}.json"

    # Si ya existe en Bronze y no es forzado, reusar dataset existente
    if dest_path.exists() and dest_path.stat().st_size > 1024 and not force:
        print(f"OK (existente) -> {dest_path}")
        return dest_path

    regiones = load_regiones()

    params = {
        "latitude": ",".join(str(r["latitud"]) for r in regiones),
        "longitude": ",".join(str(r["longitud"]) for r in regiones),
        "start_date": start_date,
        "end_date": end_date,
        "daily": DAILY_VARIABLES,
        "timezone": TIMEZONE,
    }

    # Reintentos con backoff. Open-Meteo (free tier) responde 429 cuando se supera la cuota;
    # se respeta el header Retry-After si viene, con un backoff mínimo creciente.
    max_intentos = 4
    response = None
    for attempt in range(max_intentos):
        try:
            response = requests.get(ARCHIVE_API_URL, params=params, timeout=180)
            if response.status_code == 429:
                espera = int(response.headers.get("Retry-After", 0)) or 15 * (attempt + 1)
                print(f"Aviso: Open-Meteo 429 (rate limit). Reintento {attempt + 1}/{max_intentos} en {espera}s...")
                time.sleep(espera)
                continue
            response.raise_for_status()
            break
        except Exception as e:
            if attempt == max_intentos - 1:
                if dest_path.exists() and dest_path.stat().st_size > 1024:
                    print(f"Aviso: Fallo en Open-Meteo, usando datos en caché de Bronze -> {dest_path}")
                    return dest_path
                raise e
            time.sleep(10 * (attempt + 1))

    resultados = response.json() if response else []

    # La API no siempre incluye "location_id" en el primer elemento (es implícitamente 0);
    # lo completamos aquí para poder mapear cada resultado a su región por posición.
    for idx, resultado in enumerate(resultados):
        resultado.setdefault("location_id", idx)
        resultado["region"] = regiones[idx]["region"]

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
    parser.add_argument("--force", action="store_true", help="Forzar re-descarga aunque el archivo exista")
    args = parser.parse_args()

    dest_path = download_clima(args.start, args.end, force=args.force)
    print(f"OK -> {dest_path}")


if __name__ == "__main__":
    main()
