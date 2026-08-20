"""Servidor REST API (FastAPI) para el servicio de inferencia de riesgo REAL de CENEPRED.

Envuelve el contrato Azure ML (score.init/score.run) sobre el modelo real
(data/ml/predictive_model.py). La predicción se solicita por REGIÓN.
"""

import json
import os
import sys
from contextlib import asynccontextmanager
from typing import List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from score import init, run  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    init()
    yield


app = FastAPI(
    title="API de Inferencia de Riesgo ML - CENEPRED",
    description=(
        "Servicio REST para la probabilidad de emergencia hidrometeorológica severa (MEDIO/ALTO) "
        "en los próximos 7 días por región, con XGBoost real y SHAP nativo."
    ),
    version="2.0.0",
    lifespan=lifespan,
)


class RegionQuery(BaseModel):
    departamento: str = Field(json_schema_extra={"example": "CUSCO"})
    fecha: Optional[str] = Field(default=None, json_schema_extra={"example": "2023-12-31"})


class PredictionRequest(BaseModel):
    data: List[RegionQuery]


@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "CENEPRED ML Inference API",
        "model_loaded": True,
    }


@app.post("/predict")
def predict_endpoint(payload: PredictionRequest):
    response = json.loads(run(json.dumps(payload.model_dump())))
    if response.get("status") == "ERROR":
        raise HTTPException(status_code=400, detail=response.get("message", "Error de inferencia"))
    return response


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("api_server:app", host="0.0.0.0", port=port, reload=True)
