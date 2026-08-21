"""Sincroniza la capa Gold local (data/gold/local_data/*.parquet) al contenedor ADLS `gold`
del Storage Account de CENEPRED (stcenepreddev1).

Autenticación: usa AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY del entorno. La key de datos se
obtiene con (siendo Owner de la suscripción):

    az storage account keys list --account-name stcenepreddev1 -g rg-cenepred-dev --query "[0].value" -o tsv

Uso:
    AZURE_STORAGE_ACCOUNT=stcenepreddev1 AZURE_STORAGE_KEY=<key> python scripts/sync_gold_to_adls.py
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
        print("Falta AZURE_STORAGE_KEY. Obtén la key de datos con:")
        print(f'  az storage account keys list --account-name {ACCOUNT} -g rg-cenepred-dev --query "[0].value" -o tsv')
        return 1

    from azure.storage.blob import BlobServiceClient

    parquets = sorted(GOLD_DIR.glob("*.parquet"))
    if not parquets:
        print(f"No hay parquets en {GOLD_DIR}. Genera la capa Gold primero.")
        return 1

    svc = BlobServiceClient(f"https://{ACCOUNT}.blob.core.windows.net", credential=KEY)
    container = svc.get_container_client(CONTAINER)

    for p in parquets:
        with open(p, "rb") as fh:
            container.upload_blob(name=p.name, data=fh, overwrite=True)
        print(f"subido: {p.name} ({p.stat().st_size} bytes)")

    print(f"\n{len(parquets)} tablas Gold sincronizadas a {ACCOUNT}/{CONTAINER}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
