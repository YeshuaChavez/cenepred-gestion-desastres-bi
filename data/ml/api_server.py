"""
Servidor REST API independiente para el servicio de inferencia ML de CENEPRED.
Ofrece endpoints HTTP compatibles con FastAPI / Flask y la API de Azure Machine Learning.
"""

from contextlib import asynccontextmanager
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar modelo al arrancar el servidor
    init()
    yield

app = FastAPI(
    title="API de Inferencia de Riesgo ML - CENEPRED",
    description="Servicio REST API independiente para evaluación predictiva del riesgo de emergencias climáticas.",
    version="1.0.0",
    lifespan=lifespan
)

class TelemetryPayload(BaseModel):
    departamento: Optional[str] = Field(default="NACIONAL", json_schema_extra={"example": "CUSCO"})
    precipitacion_max_24h: float = Field(default=0.0, json_schema_extra={"example": 45.2})
    precipitacion_mean_24h: float = Field(default=0.0, json_schema_extra={"example": 22.1})
    num_focos_calor_activos: int = Field(default=0, json_schema_extra={"example": 8})
    sismos_acumulados_7d: int = Field(default=0, json_schema_extra={"example": 3})
    temp_max: float = Field(default=25.0, json_schema_extra={"example": 21.5})
    temp_min: float = Field(default=15.0, json_schema_extra={"example": 8.0})
    mef_pct_ejecucion: float = Field(default=50.0, json_schema_extra={"example": 42.5})
    oni_indice: float = Field(default=0.0, json_schema_extra={"example": 0.35})

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
        response_dict = json.loads(response_str)
        return response_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en inferencia de modelo: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Iniciando Servidor API de Inferencia CENEPRED en http://0.0.0.0:{port}")
    uvicorn.run("api_server:app", host="0.0.0.0", port=port, reload=True)
