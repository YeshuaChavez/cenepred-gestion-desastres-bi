"""Descarga los límites departamentales del Perú (INEI) hacia Bronze.

No es una de las 4 fuentes analíticas del núcleo del proyecto (sección 2.4 del informe): es la
referencia geoespacial (polígonos de región) necesaria para el join geoespacial de USGS y NASA
FIRMS contra región, mencionado en la sección 5.2 ("...contra los polígonos de regiones del
Perú (shapefile INEI)"). Se descarga del mismo portal de datos abiertos que INDECI
(datosabiertos.gob.pe), dataset "limites-departamentales".

A diferencia de las 4 fuentes de monitoreo, este shapefile prácticamente no cambia con el
tiempo (los límites departamentales del Perú son estables), así que no hace falta una ventana de
fechas ni backfill: se descarga una sola vez y se refresca ocasionalmente si INEI publica una
actualización.

Uso local (antes de tener Azure Functions desplegado):
    python fetch_inei_limites.py

Escribe el archivo crudo en ../../bronze/inei_limites/local_data/ (ignorado por git), junto con
un manifiesto de metadatos de ingesta.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import requests

CKAN_PACKAGE_SHOW_URL = "https://www.datosabiertos.gob.pe/api/3/action/package_show"
DATASET_ID = "limites-departamentales"
NOMBRE_RECURSO = "Límites Departamentales"

# El portal bloquea (HTTP 418) peticiones sin un User-Agent de navegador (mismo comportamiento
# verificado en data/ingestion/indeci/fetch_indeci.py).
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}

OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "inei_limites" / "local_data"


def resolver_recurso() -> dict:
    response = requests.get(
        CKAN_PACKAGE_SHOW_URL,
        params={"id": DATASET_ID},
        headers=REQUEST_HEADERS,
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    if not payload.get("success"):
        raise RuntimeError(f"CKAN respondió sin éxito para '{DATASET_ID}': {payload}")
    result = payload["result"]
    result = result[0] if isinstance(result, list) else result

    for resource in result["resources"]:
        if resource["name"].strip() == NOMBRE_RECURSO:
            return resource
    raise LookupError(f"No se encontró el recurso '{NOMBRE_RECURSO}' en '{DATASET_ID}'")


def download_limites(output_dir: Path = OUTPUT_DIR) -> Path:
    resource = resolver_recurso()

    response = requests.get(resource["url"], headers=REQUEST_HEADERS, timeout=60)
    response.raise_for_status()

    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / "inei_departamentos_limites.zip"
    dest_path.write_bytes(response.content)

    manifest_path = output_dir / "inei_departamentos_limites.manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "INEI - Límites Departamentales (datosabiertos.gob.pe)",
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
    dest_path = download_limites()
    print(f"OK -> {dest_path}")


if __name__ == "__main__":
    main()
