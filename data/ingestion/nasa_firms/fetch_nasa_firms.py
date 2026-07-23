"""Descarga focos de calor activos (NASA FIRMS) para el territorio peruano hacia Bronze.

Usa la API "area" de FIRMS (firms.modaps.eosdis.nasa.gov), que requiere un MAP_KEY gratuito
(ver NASA_FIRMS_MAP_KEY en .env) y limita cada petición a un máximo de 5 días de rango
(verificado empíricamente: day_range > 5 devuelve HTTP 400 "Invalid day range. Expects [1..5]").

Para la ventana histórica 2012-2023 se usa la fuente VIIRS_SNPP_SP (Standard Processing), cuya
cobertura real empieza el 2012-01-20 (verificado vía /api/data_availability). El dataset
VIIRS_SNPP_NRT solo cubre los últimos ~3 meses y es el que se usaría para la ingesta diaria en
producción, no para el backfill histórico.

Uso local (antes de tener Azure Functions desplegado):
    python fetch_nasa_firms.py [--start 2012-01-20] [--end 2023-12-31]

Requiere la variable de entorno NASA_FIRMS_MAP_KEY (ver .env.example). Escribe la respuesta
cruda (CSV concatenado) en ../../bronze/nasa_firms/local_data/ (ignorado por git, representa
localmente el contenedor /bronze/incendios de ADLS Gen2), junto con un manifiesto de metadatos
de ingesta. Cuando exista la infraestructura de Azure (infra/), la función
`download_focos_calor` es el punto de reemplazo para escribir a ADLS Gen2 /bronze/incendios en
vez de disco local.
"""

from __future__ import annotations

import argparse
import os
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # python-dotenv es opcional; también funciona si la variable ya está en el entorno

AREA_API_BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

# Bounding box que cubre el territorio continental del Perú (west,south,east,north).
PERU_BBOX = "-82,-19,-68,0.5"

# Límite real de la API, verificado empíricamente (la documentación pública no lo deja claro).
MAX_DAY_RANGE = 5

SOURCE_HISTORICO = "VIIRS_SNPP_SP"  # cobertura real: 2012-01-20 en adelante

# Ventana de datos definida en la sección 2.4 del informe (misma que INDECI, USGS y Open-Meteo).
# Nota: el histórico de VIIRS_SNPP_SP empieza el 2012-01-20, no el 2012-01-01.
DEFAULT_START = "2012-01-20"
DEFAULT_END = "2023-12-31"

OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "nasa_firms" / "local_data"


def _iter_chunks(start_date: date, end_date: date, day_range: int = MAX_DAY_RANGE):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=day_range)


def download_focos_calor(
    start_date: str,
    end_date: str,
    output_dir: Path = OUTPUT_DIR,
    request_delay_seconds: float = 0.1,
) -> Path:
    map_key = os.environ.get("NASA_FIRMS_MAP_KEY")
    if not map_key:
        raise RuntimeError("Falta la variable de entorno NASA_FIRMS_MAP_KEY (ver .env.example)")

    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()

    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / f"nasa_firms_{start_date}_{end_date}.csv"

    header_written = False
    total_filas = 0
    total_peticiones = 0
    chunks_fallidos: list[str] = []

    with dest_path.open("w", encoding="utf-8", newline="") as out_file:
        for chunk_start in _iter_chunks(start, end):
            url = (
                f"{AREA_API_BASE}/{map_key}/{SOURCE_HISTORICO}/{PERU_BBOX}/"
                f"{MAX_DAY_RANGE}/{chunk_start.isoformat()}"
            )

            response = None
            for intento in range(4):  # 1 intento inicial + 3 reintentos
                try:
                    response = requests.get(url, timeout=60)
                    response.raise_for_status()
                    break
                except requests.exceptions.RequestException:
                    if intento == 3:
                        response = None
                        break
                    time.sleep(2 ** intento)  # backoff: 1s, 2s, 4s

            total_peticiones += 1

            if response is None:
                # Error persistente (ej. 500 del servidor de FIRMS) tras los reintentos:
                # se registra y se continua con el resto del backfill en vez de abortarlo todo.
                chunks_fallidos.append(chunk_start.isoformat())
                time.sleep(request_delay_seconds)
                continue

            lines = response.text.splitlines()
            if not lines:
                continue
            if lines[0].lower().startswith("invalid") or "error" in lines[0].lower():
                chunks_fallidos.append(chunk_start.isoformat())
                time.sleep(request_delay_seconds)
                continue

            body_lines = lines[1:] if header_written else lines
            if not header_written and lines:
                header_written = True

            for line in body_lines:
                out_file.write(line + "\n")
            total_filas += max(0, len(lines) - 1)

            time.sleep(request_delay_seconds)

    if chunks_fallidos:
        failed_path = output_dir / f"nasa_firms_{start_date}_{end_date}.failed_chunks.txt"
        failed_path.write_text("\n".join(chunks_fallidos), encoding="utf-8")

    manifest_path = output_dir / f"nasa_firms_{start_date}_{end_date}.manifest.json"
    import json

    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "NASA FIRMS (VIIRS_SNPP_SP, area API)",
                "start_date": start_date,
                "end_date": end_date,
                "bbox": PERU_BBOX,
                "num_peticiones": total_peticiones,
                "num_filas": total_filas,
                "num_chunks_fallidos": len(chunks_fallidos),
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

    dest_path = download_focos_calor(args.start, args.end)
    print(f"OK -> {dest_path}")


if __name__ == "__main__":
    main()
