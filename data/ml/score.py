"""Azure Machine Learning Scoring Entry Script (score.py) — contrato init()/run().

Sirve el modelo de riesgo REAL (ver data/ml/predictive_model.py). El payload identifica la
REGIÓN a evaluar; el modelo usa el último contexto real disponible en la capa Gold para esa
región (no una lectura de telemetría instantánea).

Payload esperado:
{
  "data": [
    { "departamento": "CUSCO" },
    { "departamento": "PIURA" }
  ]
}
"""

import json
import logging
import os
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("azureml.score")

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

_ready = False


def init():
    """Carga el modelo real en memoria una sola vez al arrancar el contenedor."""
    global _ready
    from predictive_model import _cargar_modelo

    _cargar_modelo()  # entrena/persiste si aún no existe, y valida que carga bien
    _ready = True
    logger.info("Modelo de inferencia real cargado correctamente.")


def run(raw_data: str) -> str:
    from predictive_model import predict_risk

    if not _ready:
        init()

    try:
        data = json.loads(raw_data)
        records = data.get("data", []) if isinstance(data, dict) else data

        predictions = []
        for record in records:
            departamento = record.get("departamento", "")
            fecha = record.get("fecha")
            predictions.append(predict_risk(departamento, fecha))

        return json.dumps(
            {"status": "SUCCESS", "model_version": "2.0.0", "predictions": predictions},
            ensure_ascii=False,
        )
    except Exception as e:  # noqa: BLE001
        logger.error(f"Error procesando la inferencia: {e}")
        return json.dumps({"status": "ERROR", "message": str(e)}, ensure_ascii=False)
