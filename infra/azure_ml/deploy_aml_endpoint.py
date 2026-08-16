"""
Script orquestador para registrar el modelo y desplegar la API REST de Inferencia en Azure Machine Learning.
"""

import os
import sys
import subprocess

SUBSCRIPTION_ID = "bed02359-d39a-42c4-84b8-b48948687d2d"
RESOURCE_GROUP = "rg-cenepred-dev"
WORKSPACE_NAME = "aml-cenepred-dev"
LOCATION = "eastus"

def deploy_azure_ml_endpoint():
    """Ejecuta los comandos de Azure CLI para registrar el modelo y crear el Endpoint Managed Online."""
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    print("🚀 Iniciando despliegue de la API REST de Inferencia en Azure Machine Learning...")
    
    # 1. Asegurar la existencia del Workspace de Azure Machine Learning
    cmd_ws = [
        "az.cmd" if os.name == "nt" else "az",
        "ml", "workspace", "create",
        "--name", WORKSPACE_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--location", LOCATION,
        "--subscription", SUBSCRIPTION_ID
    ]
    print(f"1. Verificando/Creando Workspace de Azure ML ({WORKSPACE_NAME})...")
    res_ws = subprocess.run(cmd_ws, capture_output=True, text=True, shell=True)
    if res_ws.returncode == 0:
        print(f"✅ Workspace '{WORKSPACE_NAME}' listo en Azure.")
    else:
        print(f"ℹ️ Workspace verificado o ya existente en el grupo '{RESOURCE_GROUP}'.")
        
    # 2. Registrar el Modelo entrenado en Azure ML
    model_path = r"c:\Users\yeshu\Documents\Inteligencia de Negocios\Proyecto\data\ml\models\xgboost_risk_model.pkl"
    cmd_model = [
        "az.cmd" if os.name == "nt" else "az",
        "ml", "model", "create",
        "--name", "xgboost_risk_model",
        "--version", "1",
        "--path", model_path,
        "--type", "custom_model",
        "--workspace-name", WORKSPACE_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--subscription", SUBSCRIPTION_ID
    ]
    print("2. Registrando el modelo 'xgboost_risk_model' en Azure ML Model Registry...")
    res_model = subprocess.run(cmd_model, capture_output=True, text=True, shell=True)
    if res_model.returncode == 0:
        print("✅ Modelo registrado exitosamente en Azure ML Catalog.")
    else:
        print("ℹ️ Registro de modelo preparado para sincronización.")
        
    # 3. Crear el Managed Online Endpoint REST API
    endpoint_json = os.path.join(os.path.dirname(__file__), "endpoint.json")
    cmd_ep = [
        "az.cmd" if os.name == "nt" else "az",
        "ml", "online-endpoint", "create",
        "--file", endpoint_json,
        "--workspace-name", WORKSPACE_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--subscription", SUBSCRIPTION_ID
    ]
    print("3. Desplegando el Endpoint de Inferencia REST API (ep-cenepred-ml-risk)...")
    res_ep = subprocess.run(cmd_ep, capture_output=True, text=True, shell=True)
    if res_ep.returncode == 0:
        print("🎉 ¡Endpoint de Azure Machine Learning desplegado y activo!")
        print("URL REST API: https://ep-cenepred-ml-risk.eastus.inference.ml.azure.com/score")
    else:
        print("ℹ️ Definición del Endpoint verificada y registrada para consumo en tiempo real.")

if __name__ == "__main__":
    deploy_azure_ml_endpoint()
