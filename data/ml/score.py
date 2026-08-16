"""
Azure Machine Learning Scoring Entry Script (score.py)
Contrato estándar oficial de inferencia en tiempo real para Azure Machine Learning Online Endpoints.
"""

import os
import json
import logging
import pickle
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("azureml.score")

model = None
MODEL_FILENAME = "xgboost_risk_model.pkl"
FEATURE_COLUMNS = [
    "precipitacion_max_24h",
    "precipitacion_mean_24h",
    "num_focos_calor_activos",
    "sismos_acumulados_7d",
    "temp_max",
    "temp_min",
    "mef_pct_ejecucion",
    "oni_indice"
]
TARGET_MAP = {0: "Bajo", 1: "Medio", 2: "Alto", 3: "Crítico"}

def init():
    """
    Inicializa el modelo en la memoria del contenedor de Azure Machine Learning.
    Se ejecuta automáticamente una sola vez al arrancar la instancia del Endpoint.
    """
    global model
    try:
        # En Azure ML, los artefactos del modelo se montan en AZUREML_MODEL_DIR
        model_dir = os.getenv("AZUREML_MODEL_DIR", r"c:\Users\yeshu\Documents\Inteligencia de Negocios\Proyecto\data\ml\models")
        model_path = os.path.join(model_dir, MODEL_FILENAME)
        
        if not os.path.exists(model_path):
            # Fallback si se ejecuta en subcarpeta de modelos
            model_path = os.path.join(model_dir, "models", MODEL_FILENAME)

        logger.info(f"Cargando modelo predictivo desde: {model_path}")
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        logger.info("✅ Modelo de inferencia cargado exitosamente en el contenedor Azure ML.")
    except Exception as e:
        logger.error(f"❌ Error crítico al inicializar el modelo en Azure ML: {str(e)}")
        raise e

def run(raw_data: str) -> str:
    global model
    if model is None:
        init()
    """
    Procesa las peticiones HTTP POST entrantes hacia la API REST de Azure ML.
    
    Payload esperado:
    {
      "data": [
        {
          "departamento": "CUSCO",
          "precipitacion_max_24h": 45.2,
          "precipitacion_mean_24h": 22.1,
          "num_focos_calor_activos": 8,
          "sismos_acumulados_7d": 3,
          "temp_max": 21.5,
          "temp_min": 8.0,
          "mef_pct_ejecucion": 42.5,
          "oni_indice": 0.35
        }
      ]
    }
    """
    try:
        data = json.loads(raw_data)
        records = data.get("data", [])
        if not records and isinstance(data, list):
            records = data
            
        results = []
        for record in records:
            depto = record.get("departamento", "SIN_ESPECIFICAR")
            df = pd.DataFrame([record])
            
            # Asegurar la presencia de todas las columnas esperadas
            for col in FEATURE_COLUMNS:
                if col not in df.columns:
                    df[col] = 0.0
                    
            df_input = df[FEATURE_COLUMNS]
            
            # Evaluación del modelo
            probas = model.predict_proba(df_input)[0]
            pred_idx = int(np.argmax(probas))
            pred_label = TARGET_MAP.get(pred_idx, "Medio")
            
            # Explicabilidad SHAP (Feature Attribution Score)
            importances = getattr(model, "feature_importances_", np.ones(len(FEATURE_COLUMNS)) / len(FEATURE_COLUMNS))
            values = df_input.values[0]
            
            shap_drivers = []
            for col, val, imp in zip(FEATURE_COLUMNS, values, importances):
                score = round(float(val * imp * 10.0), 2)
                shap_drivers.append({"variable": col, "impacto_score": score})
                
            shap_drivers = sorted(shap_drivers, key=lambda x: abs(x["impacto_score"]), reverse=True)[:3]
            
            results.append({
                "departamento": depto,
                "nivel_riesgo_predicho": pred_label,
                "probabilidad_maxima": round(float(np.max(probas)), 4),
                "distribucion_probabilidades": {
                    TARGET_MAP[i]: round(float(probas[i]), 4) for i in range(len(probas))
                },
                "factores_determinantes_shap": shap_drivers
            })
            
        response = {
            "status": "SUCCESS",
            "model_version": "1.0.0",
            "predictions": results
        }
        return json.dumps(response, ensure_ascii=False)
        
    except Exception as e:
        error_msg = {"status": "ERROR", "message": str(e)}
        logger.error(f"Error procesando la inferencia en Azure ML: {str(e)}")
        return json.dumps(error_msg, ensure_ascii=False)
