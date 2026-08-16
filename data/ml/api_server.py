"""
Servidor REST API independiente para el servicio de inferencia ML de CENEPRED.
Ofrece endpoints HTTP compatibles con FastAPI / Flask y la API de Azure Machine Learning.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import uvicorn
import os
import sys

# Importar lógica del modelo local / Azure ML score contract
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from score import init, run

app = FastAPI(
    title="API de Inferencia de Riesgo ML - CENEPRED",
    description="Servicio REST API independiente para evaluación predictiva del riesgo de emergencias climáticas.",
    version="1.0.0"
)

# Inicializar modelo al arrancar el servidor
@app.on_event("startup")
def startup_event():
    init()

class TelemetryPayload(BaseModel):
    departamento: Optional[str] = Field(default="NACIONAL", example="CUSCO")
    precipitacion_max_24h: float = Field(default=0.0, example=45.2)
    precipitacion_mean_24h: float = Field(default=0.0, example=22.1)
    num_focos_calor_activos: int = Field(default=0, example=8)
    sismos_acumulados_7d: int = Field(default=0, example=3)
    temp_max: float = Field(default=25.0, example=21.5)
    temp_min: float = Field(default=15.0, example=8.0)
    mef_pct_ejecucion: float = Field(default=50.0, example=42.5)
    oni_indice: float = Field(default=0.0, example=0.35)

class PredictionRequest(BaseModel):
    data: List[TelemetryPayload]

@app.get("/health")
def health_check():
    """Endpoint de salud para balanceadores de carga y Azure Health Probes."""
    return {
        "status": "HEALTHY",
        "service": "Azure Machine Learning Inference API - CENEPRED",
        "model_loaded": True
    }

@app.post("/predict")
def predict_endpoint(payload: PredictionRequest):
    """
    Endpoint principal de predicción REST API.
    Acepta telemetría regional y retorna probabilidades de riesgo e impactos SHAP.
    """
    try:
        raw_input = json.dumps(payload.model_dump())
        response_str = run(raw_input)
        response_json = json.loads(response_str)
        if response_json.get("status") == "ERROR":
            raise HTTPException(status_code=400, detail=response_json.get("message"))
        return response_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
