# Conectar Power BI al Gold de ADLS (data lake que se refresca solo)

El data lake `stcenepreddev1/gold` se actualiza a diario vía ADF → Databricks. Power BI se
conecta a esos parquet; un **Actualizar** trae siempre lo último.

## Opción rápida: el archivo `.pbids`
Doble clic en **`cenepred_gold.pbids`** → Power BI Desktop abre la conexión a
`https://stcenepreddev1.dfs.core.windows.net/gold`. Te pedirá autenticación (ver abajo), luego
navegas y seleccionas los `.parquet`.

## Autenticación (elige una)
- **Clave de cuenta (lo más simple):** en el diálogo elige *Account key* y pega la key:
  ```
  az storage account keys list --account-name stcenepreddev1 -g rg-cenepred-dev --query "[0].value" -o tsv
  ```
- **Cuenta organizacional:** requiere que te asignes el rol *Storage Blob Data Reader* sobre
  la cuenta de almacenamiento (tu cuenta hoy tiene control-plane pero no data-plane).

## Opción confiable: pegar Power Query (M) por tabla
En Power BI: **Inicio → Transformar datos → Nueva consulta → Consulta en blanco →
Editor avanzado**, y pega uno de estos por cada tabla (crea una consulta por tabla):

**dim_region**
```m
let Source = Parquet.Document(AzureStorage.DataLakeContents("https://stcenepreddev1.dfs.core.windows.net/gold/dim_region.parquet")) in Source
```
**dim_tiempo**
```m
let Source = Parquet.Document(AzureStorage.DataLakeContents("https://stcenepreddev1.dfs.core.windows.net/gold/dim_tiempo.parquet")) in Source
```
**dim_fenomeno**
```m
let Source = Parquet.Document(AzureStorage.DataLakeContents("https://stcenepreddev1.dfs.core.windows.net/gold/dim_fenomeno.parquet")) in Source
```
**fact_monitoreo_diario** (la tabla dinámica, se refresca a diario)
```m
let Source = Parquet.Document(AzureStorage.DataLakeContents("https://stcenepreddev1.dfs.core.windows.net/gold/fact_monitoreo_diario.parquet")) in Source
```
**fact_emergencias**
```m
let Source = Parquet.Document(AzureStorage.DataLakeContents("https://stcenepreddev1.dfs.core.windows.net/gold/fact_emergencias.parquet")) in Source
```
**fact_gasto_prevaed**
```m
let Source = Parquet.Document(AzureStorage.DataLakeContents("https://stcenepreddev1.dfs.core.windows.net/gold/fact_gasto_prevaed.parquet")) in Source
```

## Modelo (estrella)
En la vista **Modelo**, relaciona:
- `fact_monitoreo_diario[region_id]` → `dim_region[region_id]`
- `fact_monitoreo_diario[fecha_id]` → `dim_tiempo[fecha_id]`
- `fact_emergencias[region_id]` → `dim_region[region_id]`
- `fact_emergencias[fecha_id]` → `dim_tiempo[fecha_id]`
- `fact_emergencias[fenomeno_id]` → `dim_fenomeno[fenomeno_id]`
- `fact_gasto_prevaed[region_id]` → `dim_region[region_id]` (grano anual: relación por `anio`)

Las medidas DAX ya están en **`medidas_dax.dax`** (mismo folder) — pégalas como *Nueva medida*.

> Nota: `AzureStorage.DataLakeContents` pide autenticación la primera vez (Account key o cuenta
> org con rol Storage Blob Data Reader), igual que el `.pbids`.
