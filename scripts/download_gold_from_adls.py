"""Descarga todos los .parquet del contenedor ADLS `gold` a data/gold/local_data/.

Lo usa el GitHub Action (daily_pipeline_sync) para regenerar realData.json del webapp desde el
Gold fresco que dejó el pipeline diario de Databricks, sin recomputar nada.

Requiere AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY en el entorno.
"""

from __future__ import annotations

import os
from pathlib import Path

GOLD_DIR = Path(__file__).resolve().parents[1] / "data" / "gold" / "local_data"
ACCOUNT = os.getenv("AZURE_STORAGE_ACCOUNT", "stcenepreddev1")
CONTAINER = os.getenv("ADLS_GOLD_CONTAINER", "gold")
KEY = os.getenv("AZURE_STORAGE_KEY")


def main() -> int:
    if not KEY:
        print("Falta AZURE_STORAGE_KEY para descargar el Gold desde ADLS.")
        return 1

    from azure.storage.blob import BlobServiceClient

    GOLD_DIR.mkdir(parents=True, exist_ok=True)
    container = BlobServiceClient(
        f"https://{ACCOUNT}.blob.core.windows.net", credential=KEY
    ).get_container_client(CONTAINER)

    n = 0
    for blob in container.list_blobs():
        if blob.name.endswith(".parquet"):
            (GOLD_DIR / blob.name).write_bytes(container.download_blob(blob.name).readall())
            print(f"descargado: {blob.name}")
            n += 1

    if n == 0:
        print(f"No se descargó ningún parquet de {ACCOUNT}/{CONTAINER}.")
        return 1
    print(f"{n} parquet del Gold descargados a {GOLD_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
