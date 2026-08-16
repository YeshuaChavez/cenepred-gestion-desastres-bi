#!/usr/bin/env python
"""
===============================================================================
CENEPRED BI — MASTER PIPELINE ORCHESTRATOR
===============================================================================
Este script de orquestación master ejecuta secuencialmente la canalización de
datos Medallón (Bronze -> Silver -> Gold) y publica los artefactos para la
plataforma WebApp y Power BI.

Puede ejecutarse localmente, en Azure Batch, Azure Databricks o desde una
Custom Activity en Azure Data Factory (ADF).
===============================================================================
"""

import sys
import os
import subprocess
import logging
from datetime import datetime, timezone

# Asegurar codificación UTF-8 en consola Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Configurar Logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def run_step(step_name: str, cmd: list):
    """Ejecuta un paso del pipeline con control de errores e impresiones de estado."""
    logging.info(f"🚀 Iniciando Paso: {step_name}...")
    start_time = datetime.now()
    
    try:
        res = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, check=True)
        duration = (datetime.now() - start_time).total_seconds()
        logging.info(f"✅ {step_name} completado con éxito ({duration:.2f}s).")
        if res.stdout.strip():
            for line in res.stdout.strip().splitlines()[-5:]:
                logging.info(f"   [out] {line}")
        return True
    except subprocess.CalledProcessError as e:
        duration = (datetime.now() - start_time).total_seconds()
        logging.error(f"❌ Error en {step_name} ({duration:.2f}s): {e}")
        if e.stdout:
            logging.error(f"   [stdout] {e.stdout[-1000:]}")
        if e.stderr:
            logging.error(f"   [stderr] {e.stderr[-1000:]}")
        raise e

def main():
    logging.info("=" * 80)
    logging.info("🔥 CENEPRED BI DATA PIPELINE — EJECUCIÓN AUTOMATIZADA MASTER 🔥")
    logging.info(f"Directorio Raíz: {PROJECT_ROOT}")
    logging.info(f"Marca de Tiempo: {datetime.now(timezone.utc).isoformat()} UTC")
    logging.info("=" * 80)

    # -------------------------------------------------------------------------
    # CAPA 1: BRONZE (Ingesta de Fuentes Externas)
    # -------------------------------------------------------------------------
    logging.info("\n--- 1. INGESTA BRONZE ---")
    run_step("Bronze: Ingesta INDECI/SINPAD", [sys.executable, "data/ingestion/indeci/fetch_indeci.py"])
    run_step("Bronze: Ingesta NASA FIRMS (Focos de Calor)", [sys.executable, "data/ingestion/nasa_firms/fetch_nasa_firms.py"])
    run_step("Bronze: Ingesta NOAA ONI (Índice El Niño)", [sys.executable, "data/ingestion/noaa_oni/fetch_oni.py"])
    run_step("Bronze: Ingesta Open-Meteo (Telemetría Satelital)", [sys.executable, "data/ingestion/open_meteo/fetch_open_meteo.py"])
    run_step("Bronze: Ingesta USGS (Sismicidad Nacional)", [sys.executable, "data/ingestion/usgs/fetch_usgs.py"])
    run_step("Bronze: Ingesta INEI Límites Regionales", [sys.executable, "data/ingestion/inei_limites/fetch_inei_limites.py"])

    # -------------------------------------------------------------------------
    # CAPA 2: SILVER (Limpieza & Reglas de Calidad)
    # -------------------------------------------------------------------------
    logging.info("\n--- 2. TRANSFORMACIÓN & LIMPIEZA SILVER ---")
    run_step("Silver: Limpieza INDECI", [sys.executable, "data/silver/indeci/limpieza_indeci.py"])
    run_step("Silver: Limpieza MEF PP 0068", [sys.executable, "data/silver/mef_pp0068/limpieza_mef_pp0068.py"])
    run_step("Silver: Limpieza NASA FIRMS", [sys.executable, "data/silver/nasa_firms/limpieza_nasa_firms.py"])
    run_step("Silver: Limpieza NOAA ONI", [sys.executable, "data/silver/noaa_oni/limpieza_oni.py"])
    run_step("Silver: Limpieza Open-Meteo", [sys.executable, "data/silver/open_meteo/limpieza_open_meteo.py"])
    run_step("Silver: Limpieza USGS", [sys.executable, "data/silver/usgs/limpieza_usgs.py"])
    
    # QA Data Quality Validation Gate
    run_step("Silver QA: Control de Calidad de Datos", [sys.executable, "data/quality/validar_silver.py"])

    # -------------------------------------------------------------------------
    # CAPA 3: GOLD (Modelado Dimensional Star Schema)
    # -------------------------------------------------------------------------
    logging.info("\n--- 3. MODELADO GOLD (STAR SCHEMA) ---")
    run_step("Gold: Dimensión Región", [sys.executable, "data/gold/dim_region.py"])
    run_step("Gold: Dimensión Tiempo", [sys.executable, "data/gold/dim_tiempo.py"])
    run_step("Gold: Dimensión Fenómeno", [sys.executable, "data/gold/dim_fenomeno.py"])
    run_step("Gold: Hechos Emergencias SINPAD", [sys.executable, "data/gold/fact_emergencias.py"])
    run_step("Gold: Hechos Gasto PREVAED MEF", [sys.executable, "data/gold/fact_gasto_prevaed.py"])
    run_step("Gold: Hechos Monitoreo Diario Satelital", [sys.executable, "data/gold/fact_monitoreo_diario.py"])

    # -------------------------------------------------------------------------
    # CAPA 4: PUBLICACIÓN & EXPORTACIÓN
    # -------------------------------------------------------------------------
    logging.info("\n--- 4. PUBLICACIÓN WEBAPP & POWER BI ---")
    run_step("Export: Consolidado Gold a WebApp JSON", [sys.executable, "scripts/export_gold_to_webapp_json.py"])

    # -------------------------------------------------------------------------
    # CAPA 5: DISPATCH DE ALERTAS TEMPRANAS
    # -------------------------------------------------------------------------
    logging.info("\n--- 5. DESPACHO DE ALERTAS TEMPRANAS ---")
    run_step("Alerts: Evaluación y Envío de Alertas Tempranas", [sys.executable, "data/pipelines/alert_dispatcher.py"])

    logging.info("\n" + "=" * 80)
    logging.info("🎉 PIPELINE AUTOMATIZADO COMPLETADO CON ÉXITO CERO ERRORES 🎉")
    logging.info("=" * 80)

if __name__ == "__main__":
    main()
