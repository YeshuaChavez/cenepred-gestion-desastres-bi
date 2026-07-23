# Pipelines de Azure Data Factory

Definiciones (JSON/ARM o Terraform `azurerm_data_factory_pipeline`) de la orquestación maestra:
programa la verificación de INDECI y la ingesta diaria de Open-Meteo, USGS y NASA FIRMS, y dispara
los notebooks de Databricks para las transformaciones Bronze → Silver → Gold (ver sección 5.1 del
informe).
