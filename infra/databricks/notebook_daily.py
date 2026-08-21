# Databricks notebook source
# Notebook que ejecuta el pipeline diario CENEPRED en el job cluster de Databricks.
# Clona el repo público, instala las deps del path diario, inyecta los secretos del
# scope `cenepred` y corre master_pipeline.py --daily (refresca Gold y lo sube a ADLS).
import subprocess
import os
import sys

subprocess.run(["rm", "-rf", "/tmp/cenepred"], check=False)
subprocess.run(["git", "clone", "--depth", "1",
                "https://github.com/YeshuaChavez/cenepred-gestion-desastres-bi", "/tmp/cenepred"], check=True)
# pandas/pyarrow/requests ya vienen en el Databricks Runtime; reinstalarlos rompe el ABI de
# numpy. Solo instalamos lo que falta en el runtime.
subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                "geopandas", "pandera", "azure-storage-blob"], check=True)

os.environ["NASA_FIRMS_MAP_KEY"] = dbutils.secrets.get("cenepred", "nasa-firms-key")  # noqa: F821
os.environ["AZURE_STORAGE_KEY"] = dbutils.secrets.get("cenepred", "adls-key")  # noqa: F821
os.environ["AZURE_STORAGE_ACCOUNT"] = dbutils.secrets.get("cenepred", "adls-account")  # noqa: F821

r = subprocess.run([sys.executable, "data/pipelines/master_pipeline.py", "--daily"],
                   cwd="/tmp/cenepred", capture_output=True, text=True)
print(r.stdout[-7000:])
print("========== STDERR ==========")
print(r.stderr[-4000:])

if r.returncode != 0:
    tail = (r.stdout[-2500:] + " || STDERR: " + r.stderr[-1500:]).replace(chr(10), " | ")
    raise SystemExit("PIPELINE FALLO: " + tail)
print("OK: pipeline diario completado")
