"""Descarga las dimensiones ESTÁTICAS (dim_region, dim_tiempo) desde el contenedor ADLS `gold`
a data/gold/local_data/.

El job diario solo refresca la telemetría dinámica (fact_monitoreo_diario), que necesita esas
dims. Pero dim_region depende de fuentes históricas (INDECI/INEI) que no cambian a diario y cuyo
portal bloquea la IP de la nube, así que en vez de reconstruirla se reutiliza la versión ya
publicada en el data lake por la última corrida COMPLETA.

Requiere AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY en el entorno.
"""

from __future__ import annotations

import os
from pathlib import Path

GOLD_DIR = Path(__file__).resolve().parents[1] / "data" / "gold" / "local_data"
ACCOUNT = os.getenv("AZURE_STORAGE_ACCOUNT", "stcenepreddev1")
CONTAINER = os.getenv("ADLS_GOLD_CONTAINER", "gold")
KEY = os.getenv("AZURE_STORAGE_KEY")
DIMS = ["dim_region.parquet", "dim_tiempo.parquet"]


def main() -> int:
    if not KEY:
        print("Falta AZURE_STORAGE_KEY para descargar las dims desde ADLS.")
        return 1

    from azure.storage.blob import BlobServiceClient

    GOLD_DIR.mkdir(parents=True, exist_ok=True)
    svc = BlobServiceClient(f"https://{ACCOUNT}.blob.core.windows.net", credential=KEY)
    container = svc.get_container_client(CONTAINER)

    for name in DIMS:
        data = container.download_blob(name).readall()
        (GOLD_DIR / name).write_bytes(data)
        print(f"descargado: {name} ({len(data)} bytes)")

    print(f"{len(DIMS)} dimensiones estáticas descargadas desde {ACCOUNT}/{CONTAINER}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
