"""Acceso centralizado a secretos vía Azure Key Vault, con fallback a variables de entorno.

Fuente de verdad prevista: el Key Vault del proyecto (kv-cenepred-dev1), identificado por la
variable de entorno KEY_VAULT_URI (p.ej. https://kv-cenepred-dev1.vault.azure.net) o por
KEY_VAULT_NAME. La autenticación usa DefaultAzureCredential, que resuelve la identidad sola en
cada contexto: `az login` en local, e identidad administrada en ADF / Databricks / Azure ML.

Diseño intencionalmente compatible hacia atrás y sin acoplar dependencias:

  1. Si el secreto ya está en el entorno (nombre `env`), se usa ese valor. Así el desarrollo
     local con .env y el CI con variables/secretos del repo siguen funcionando sin cambios.
  2. Si no, y hay un Key Vault configurado, se lee de ahí.
  3. Si tampoco, se devuelve `default`.

Las dependencias de Azure (azure-identity, azure-keyvault-secrets) se importan de forma perezosa
solo cuando hay un Key Vault configurado, de modo que importar este módulo nunca falla aunque esas
librerías no estén instaladas y no haya Key Vault (el caso de las pruebas y el uso local).
"""

from __future__ import annotations

import logging
import os
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _client():
    """Devuelve un SecretClient de Key Vault, o None si no hay Key Vault configurado/disponible."""
    uri = os.getenv("KEY_VAULT_URI")
    name = os.getenv("KEY_VAULT_NAME") or os.getenv("AZURE_KEY_VAULT_NAME")
    if not uri and name:
        uri = f"https://{name}.vault.azure.net"
    if not uri:
        return None
    try:
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.secrets import SecretClient

        return SecretClient(vault_url=uri, credential=DefaultAzureCredential())
    except Exception as exc:  # noqa: BLE001 - falta de librería o de credenciales: se cae a env
        logger.warning("Key Vault no disponible (%s); se usará el entorno.", exc)
        return None


def get_secret(name: str, env: Optional[str] = None, default: Optional[str] = None) -> Optional[str]:
    """Obtiene un secreto por nombre de Key Vault.

    Args:
        name: nombre del secreto en Key Vault (p.ej. "adls-key").
        env: nombre de la variable de entorno equivalente que tiene prioridad si está definida
             (p.ej. "AZURE_STORAGE_KEY"), para no romper local/CI.
        default: valor a devolver si no se encuentra en ningún lado.
    """
    if env:
        value = os.getenv(env)
        if value:
            return value

    client = _client()
    if client is not None:
        try:
            return client.get_secret(name).value
        except Exception as exc:  # noqa: BLE001 - secreto ausente o sin permiso: se cae a default
            logger.warning("No se pudo leer el secreto '%s' de Key Vault (%s).", name, exc)

    return os.getenv(name, default)
