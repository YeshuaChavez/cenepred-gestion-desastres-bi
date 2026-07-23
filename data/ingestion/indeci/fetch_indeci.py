"""Descarga el histórico de emergencias de INDECI (datosabiertos.gob.pe) hacia Bronze.

INDECI publica el histórico como un dataset por año en CKAN: "mapa-de-emergencias-{year}",
con un recurso ZIP (shapefile) por año. También existe un dataset tabular separado
("emergencias-historicas-registradas-por-indeci", CSV/XLS 2003-2018), pero sus enlaces de
descarga están rotos (HTTP 404) en el propio servidor de archivos de INDECI al momento de
escribir este script, así que no se usa.

Las URLs de descarga no siguen un patrón 100% consistente entre años (ej. 2018 y 2023 rompen
la convención de nombre de archivo de los demás años), así que este script consulta la API de
CKAN (package_show) para obtener la URL real de cada año en vez de construirla a mano.

Uso local (antes de tener Azure Functions desplegado):
    python fetch_indeci.py

Escribe cada archivo crudo descargado en ../../bronze/indeci/local_data/ (ignorado por git,
representa localmente el contenedor /bronze/indeci de ADLS Gen2), junto con un manifiesto de
metadatos de ingesta. Cuando exista la infraestructura de Azure (infra/), la función
`download_resource` es el punto de reemplazo para escribir a ADLS Gen2 /bronze/indeci en vez de
disco local.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import requests

CKAN_PACKAGE_SHOW_URL = "https://www.datosabiertos.gob.pe/api/3/action/package_show"
MAPA_DATASET_ID_TEMPLATE = "mapa-de-emergencias-{year}"

# El portal bloquea (HTTP 418) peticiones sin un User-Agent de navegador.
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}

# Ventana de datos definida en la sección 2.4 del informe.
YEAR_RANGE = range(2012, 2024)  # 2012-2023 inclusive

OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "indeci" / "local_data"


@dataclass
class IndeciResource:
    year: int
    name: str
    format: str
    url: str


def _get_package(dataset_id: str) -> dict:
    response = requests.get(
        CKAN_PACKAGE_SHOW_URL,
        params={"id": dataset_id},
        headers=REQUEST_HEADERS,
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    if not payload.get("success"):
        raise RuntimeError(f"CKAN respondió sin éxito para el dataset '{dataset_id}': {payload}")
    result = payload["result"]
    # Este portal (a diferencia de un CKAN estándar) envuelve el resultado de package_show
    # en una lista de un solo elemento.
    return result[0] if isinstance(result, list) else result


def resolve_resource_for_year(year: int) -> IndeciResource:
    """Consulta CKAN y devuelve el recurso real (nombre, formato, URL) del shapefile de un año."""
    dataset_id = MAPA_DATASET_ID_TEMPLATE.format(year=year)
    package = _get_package(dataset_id)
    resources = package["resources"]
    if not resources:
        raise LookupError(f"El dataset '{dataset_id}' no tiene recursos")
    resource = resources[0]
    return IndeciResource(year, resource["name"], resource["format"], resource["url"])


def download_resource(resource: IndeciResource, output_dir: Path = OUTPUT_DIR) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    extension = resource.url.rsplit(".", 1)[-1]
    dest_path = output_dir / f"indeci_{resource.year}.{extension}"

    response = requests.get(resource.url, headers=REQUEST_HEADERS, timeout=60)
    response.raise_for_status()
    dest_path.write_bytes(response.content)

    manifest_path = output_dir / f"indeci_{resource.year}.manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "INDECI (datosabiertos.gob.pe)",
                "anio": resource.year,
                "nombre_recurso": resource.name,
                "formato": resource.format,
                "url_origen": resource.url,
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
            dest_path = download_resource(resource)
            print(f"[{year}] OK -> {dest_path} ({resource.format})")
        except Exception as exc:  # noqa: BLE001 - queremos seguir con los demás años si uno falla
            print(f"[{year}] ERROR: {exc}")


if __name__ == "__main__":
    main()
