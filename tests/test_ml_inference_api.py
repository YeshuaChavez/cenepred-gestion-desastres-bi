import os
import json
from fastapi.testclient import TestClient
from data.ml.predictive_model import train_and_save_model, predict_risk
from data.ml.score import init, run
from data.ml.api_server import app

client = TestClient(app)

def test_train_and_save_model():
    """Verifica que el modelo predictivo se entrene y guarde los artefactos requeridos."""
    metadata = train_and_save_model()
    assert metadata["model_name"] == "XGBoost_CENEPRED_Risk_Predictor"
    assert metadata["accuracy"] >= 0.85
    assert os.path.exists(r"c:\Users\yeshu\Documents\Inteligencia de Negocios\Proyecto\data\ml\models\xgboost_risk_model.pkl")

def test_predict_risk_shap():
    """Prueba la lógica de inferencia directa y extracción de impactos SHAP."""
    input_features = {
        "departamento": "CUSCO",
        "precipitacion_max_24h": 85.5,
        "precipitacion_mean_24h": 42.0,
        "num_focos_calor_activos": 12,
        "sismos_acumulados_7d": 4,
        "temp_max": 22.0,
        "temp_min": 5.0,
        "mef_pct_ejecucion": 35.0,
        "oni_indice": 0.45
    }
    
    result = predict_risk(input_features)
    assert result["departamento"] == "CUSCO"
    assert result["nivel_riesgo_predicho"] in ["Bajo", "Medio", "Alto", "Crítico"]
    assert 0.0 <= result["probabilidad_riesgo"] <= 1.0
    assert len(result["top_factores_determinantes_shap"]) == 3
    assert "variable" in result["top_factores_determinantes_shap"][0]

def test_score_contract_azure_ml():
    """Valida el contrato oficial init() y run() de Azure Machine Learning."""
    init()
    
    payload = {
        "data": [
            {
                "departamento": "PIURA",
                "precipitacion_max_24h": 120.0,
                "precipitacion_mean_24h": 65.0,
                "num_focos_calor_activos": 2,
                "sismos_acumulados_7d": 1,
                "temp_max": 32.0,
                "temp_min": 24.0,
                "mef_pct_ejecucion": 28.0,
                "oni_indice": 1.2
            }
        ]
    }
    
    raw_response = run(json.dumps(payload))
    res_dict = json.loads(raw_response)
    
    assert res_dict["status"] == "SUCCESS"
    assert len(res_dict["predictions"]) == 1
    assert res_dict["predictions"][0]["departamento"] == "PIURA"

def test_fastapi_health_endpoint():
    """Prueba el endpoint /health del servidor REST API."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"
    assert response.json()["model_loaded"] is True

def test_fastapi_predict_endpoint():
    """Prueba el endpoint POST /predict del servidor REST API."""
    payload = {
        "data": [
            {
                "departamento": "AREQUIPA",
                "precipitacion_max_24h": 15.0,
                "precipitacion_mean_24h": 5.0,
                "num_focos_calor_activos": 0,
                "sismos_acumulados_7d": 6,
                "temp_max": 24.0,
                "temp_min": 11.0,
                "mef_pct_ejecucion": 75.0,
                "oni_indice": -0.2
            }
        ]
    }
    
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["predictions"][0]["departamento"] == "AREQUIPA"
