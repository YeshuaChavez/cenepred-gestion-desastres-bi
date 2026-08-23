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
# pandas/pyarrow/requests ya vienen en el Databricks Runtime. geopandas arrastra numpy 2.x,
# que rompe el ABI del pyarrow del runtime (compilado contra numpy 1) y deja a pandas sin motor
# parquet. Se fija numpy<2 para mantener el stack del runtime consistente.
subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                "numpy<2", "geopandas", "pandera", "azure-storage-blob"], check=True)

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

# MERGE incremental de la ventana reciente en la tabla Delta de Unity Catalog que consume Power BI
# (dbw_cenepred_dev.default.fact_monitoreo_diario): conserva la historia y hace upsert de los
# dias recientes por (region_id, fecha_id). El .pbix solo necesita "Actualizar".
import pandas as pd  # noqa: E402

_fm = pd.read_parquet("/tmp/cenepred/data/gold/local_data/fact_monitoreo_diario.parquet")
_sdf = spark.createDataFrame(_fm)  # noqa: F821  (spark lo provee Databricks)
_sdf.createOrReplaceTempView("recent_monitoreo")
spark.sql("""
  MERGE INTO dbw_cenepred_dev.default.fact_monitoreo_diario t
  USING recent_monitoreo s
  ON t.region_id = s.region_id AND t.fecha_id = s.fecha_id
  WHEN MATCHED THEN UPDATE SET *
  WHEN NOT MATCHED THEN INSERT *
""")  # noqa: F821
print(f"MERGE en fact_monitoreo_diario (Unity Catalog): {_fm.shape[0]} filas de la ventana reciente")
