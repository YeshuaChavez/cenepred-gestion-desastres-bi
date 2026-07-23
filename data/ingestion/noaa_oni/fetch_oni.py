"""Descarga el Índice Oceánico El Niño (ONI, NOAA) hacia Bronze.

No es una de las 4 fuentes analíticas del núcleo del proyecto (sección 2.4 del informe): es una
referencia climática adicional, agregada tras encontrar que el modelo de clasificación de riesgo
(sección 10.1) tenía señal débil y que El Niño costero es un driver climático central para
inundaciones/huaicos en el Perú (ya mencionado como contexto en la sección 1.3 del informe, pero
no incorporado como variable hasta ahora).

El ONI es la media móvil de 3 meses de la anomalía de temperatura superficial del mar en la
región Niño 3.4 del Pacífico — un único valor mensual para todo el Pacífico ecuatorial, no por
región del Perú (a diferencia de las 4 fuentes del núcleo, que sí son específicas por región).

Fuente: NOAA Physical Sciences Laboratory (psl.noaa.gov), mismo dato que publica el Climate
Prediction Center. Serie mensual completa desde 1950, sin necesidad de paginar por fecha.

Uso:
    python fetch_oni.py

Escribe el archivo crudo en ../../bronze/noaa_oni/local_data/ (ignorado por git).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import requests

ONI_URL = "https://psl.noaa.gov/data/correlation/oni.data"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "noaa_oni" / "local_data"


def download_oni(output_dir: Path = OUTPUT_DIR) -> Path:
    response = requests.get(ONI_URL, timeout=30)
    response.raise_for_status()

    output_dir.mkdir(parents=True, exist_ok=True)
    dest_path = output_dir / "oni.data.txt"
    dest_path.write_text(response.text, encoding="utf-8")

    manifest_path = output_dir / "oni.manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "fuente": "NOAA PSL - Oceanic Niño Index (ONI)",
                "url_origen": ONI_URL,
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
    dest_path = download_oni()
    print(f"OK -> {dest_path}")


if __name__ == "__main__":
    main()
