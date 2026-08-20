"""Orquesta el registro del modelo y el despliegue del Managed Online Endpoint en Azure ML.

Requisitos: Azure CLI con la extensión `ml` (`az extension add -n ml`) y sesión iniciada
(`az login`). Antes de ejecutar, genera los artefactos del modelo:

    python data/ml/predictive_model.py

El modelo se registra como CARPETA (pkl + snapshot + metadata juntos) para que el endpoint
sea autocontenido: score.py los carga desde AZUREML_MODEL_DIR sin necesitar la capa Gold.
"""

import os
import subprocess
import sys
from pathlib import Path

SUBSCRIPTION_ID = "bed02359-d39a-42c4-84b8-b48948687d2d"
RESOURCE_GROUP = "rg-cenepred-dev"
WORKSPACE_NAME = "aml-cenepred-dev"
LOCATION = "eastus"

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
MODEL_DIR = REPO_ROOT / "data" / "ml" / "models"
AZ = "az.cmd" if os.name == "nt" else "az"


def _run(step: str, args: list[str]) -> bool:
    """Ejecuta un comando de Azure CLI, muestra el error real y devuelve si tuvo éxito."""
    print(f"\n>> {step}")
    res = subprocess.run([AZ, *args], capture_output=True, text=True, shell=(os.name == "nt"))
    if res.returncode == 0:
        print(f"OK: {step}")
        return True
    print(f"ERROR en '{step}' (returncode {res.returncode}):")
    print((res.stderr or res.stdout or "").strip()[:2000])
    return False


def deploy_azure_ml_endpoint() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    model_pkl = MODEL_DIR / "xgboost_risk_model.pkl"
    if not model_pkl.exists():
        print(f"ERROR: no existen los artefactos del modelo en {MODEL_DIR}.")
        print("Ejecuta primero: python data/ml/predictive_model.py")
        return 1

    common = ["--workspace-name", WORKSPACE_NAME, "--resource-group", RESOURCE_GROUP,
              "--subscription", SUBSCRIPTION_ID]

    # 1. Workspace
    if not _run("Verificar/crear Workspace", [
        "ml", "workspace", "create", "--name", WORKSPACE_NAME,
        "--resource-group", RESOURCE_GROUP, "--location", LOCATION,
        "--subscription", SUBSCRIPTION_ID,
    ]):
        return 1

    # 2. Registrar el MODELO como carpeta (pkl + snapshot + metadata)
    if not _run("Registrar modelo (carpeta) en el Model Registry", [
        "ml", "model", "create", "--name", "xgboost_risk_model", "--version", "1",
        "--path", str(MODEL_DIR), "--type", "custom_model", *common,
    ]):
        return 1

    # 3. Crear el endpoint
    if not _run("Crear Managed Online Endpoint", [
        "ml", "online-endpoint", "create", "--file", str(HERE / "endpoint.json"), *common,
    ]):
        return 1

    # 4. Crear el DEPLOYMENT (modelo + code score.py + entorno con xgboost)
    if not _run("Crear deployment 'blue'", [
        "ml", "online-deployment", "create", "--file", str(HERE / "deployment.json"),
        "--all-traffic", *common,
    ]):
        return 1

    print("\nEndpoint desplegado. Obtén la URI y la key con:")
    print(f"  az ml online-endpoint show -n ep-cenepred-ml-risk {' '.join(common)}")
    print(f"  az ml online-endpoint get-credentials -n ep-cenepred-ml-risk {' '.join(common)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(deploy_azure_ml_endpoint())
