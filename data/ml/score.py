"""Azure Machine Learning Scoring Entry Script (score.py) — contrato init()/run().

Sirve el modelo de riesgo REAL (ver data/ml/predictive_model.py). El payload identifica la
REGIÓN a evaluar; el modelo usa el último contexto real disponible en la capa Gold para esa
región (empaquetado en el snapshot del propio modelo, no requiere Gold en runtime).

En Azure ML el modelo se monta en AZUREML_MODEL_DIR; init() carga desde ahí los tres artefactos
(modelo, snapshot, features) una sola vez.

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

_modelo = None
_snapshot = None
_features = None


def init():
    """Carga el modelo real y sus artefactos en memoria una sola vez al arrancar el contenedor."""
    global _modelo, _snapshot, _features
    from predictive_model import cargar_artefactos

    _modelo, _snapshot, _features = cargar_artefactos()
    logger.info("Modelo de inferencia real cargado correctamente (%d regiones).", len(_snapshot))


def run(raw_data: str) -> str:
    from predictive_model import predecir

    if _modelo is None:
        init()

    try:
        data = json.loads(raw_data)
        records = data.get("data", []) if isinstance(data, dict) else data

        predictions = [predecir(_modelo, _snapshot, _features, r.get("departamento", "")) for r in records]

        return json.dumps(
            {"status": "SUCCESS", "model_version": "2.0.0", "predictions": predictions},
            ensure_ascii=False,
        )
    except Exception as e:  # noqa: BLE001
        logger.error(f"Error procesando la inferencia: {e}")
        return json.dumps({"status": "ERROR", "message": str(e)}, ensure_ascii=False)
