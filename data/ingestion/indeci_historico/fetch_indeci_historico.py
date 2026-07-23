"""Descarga el histórico EXTENDIDO de emergencias de INDECI (2003-2011) hacia Bronze.

No forma parte de la ventana 2012-2023 usada en el resto del proyecto (sección 2.4 del informe):
esa ventana está acotada específicamente para que INDECI coincida con la cobertura real de
Open-Meteo/USGS/NASA FIRMS. Este script existe solo para el componente de forecasting (sección
10.1), que usa únicamente el conteo histórico de emergencias de INDECI —no necesita alinearse con
las otras 3 fuentes— y se beneficia de más años de historia para aprender mejor la estacionalidad
y los ciclos de El Niño/La Niña (ver ml/training/forecasting_prophet_sarima.py).

Mismo mecanismo que data/ingestion/indeci/fetch_indeci.py (API CKAN, serie "Mapa de Emergencias").
El año 2007 no tiene URL de descarga disponible en el portal (mismo caso ya documentado para el
dataset histórico original) y se omite.

Uso:
    python fetch_indeci_historico.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import requests

CKAN_PACKAGE_SHOW_URL = "https://www.datosabiertos.gob.pe/api/3/action/package_show"
MAPA_DATASET_ID_TEMPLATE = "mapa-de-emergencias-{year}"

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}

# 2003-2011, complementa la ventana 2012-2023 del resto del proyecto. 2007 no tiene URL de
# descarga disponible (verificado) y se omite.
YEAR_RANGE = [y for y in range(2003, 2012) if y != 2007]

OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "indeci_historico" / "local_data"


def _get_package(dataset_id: str) -> dict:
    response = requests.get(
        CKAN_PACKAGE_SHOW_URL, params={"id": dataset_id}, headers=REQUEST_HEADERS, timeout=30
    )
    response.raise_for_status()
    payload = response.json()
    if not payload.get("success"):
        raise RuntimeError(f"CKAN respondió sin éxito para '{dataset_id}': {payload}")
    result = payload["result"]
    return result[0] if isinstance(result, list) else result


def resolve_resource_for_year(year: int) -> dict:
    package = _get_package(MAPA_DATASET_ID_TEMPLATE.format(year=year))
    resources = package["resources"]
    if not resources:
        raise LookupError(f"El dataset de {year} no tiene recursos")
    return resources[0]


def download_resource(year: int, resource: dict, output_dir: Path = OUTPUT_DIR) -> Path:
    response = requests.get(resource["url"], headers=REQUEST_HEADERS, timeout=60)
    response.raise_for_status()

    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / f"indeci_historico_{year}.zip"
    dest_path.write_bytes(response.content)

    manifest_path = output_dir / f"indeci_historico_{year}.manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "INDECI (datosabiertos.gob.pe) - extensión histórica 2003-2011",
                "anio": year,
                "nombre_recurso": resource["name"],
                "formato": resource["format"],
                "url_origen": resource["url"],
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
    for year in YEAR_RANGE:
        try:
            resource = resolve_resource_for_year(year)
            dest_path = download_resource(year, resource)
            print(f"[{year}] OK -> {dest_path}")
        except Exception as exc:  # noqa: BLE001
            print(f"[{year}] ERROR: {exc}")


if __name__ == "__main__":
    main()
