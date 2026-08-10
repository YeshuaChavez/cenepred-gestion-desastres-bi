# Modelo de Datos Dimensional en Power BI (Capa Gold)

Este documento define la especificación técnica del **Modelo Dimensional (Constelación de Hechos)** cargado en Power BI Desktop desde **Azure Databricks Unity Catalog / Serverless SQL Warehouse**.

---

## 1. Parámetros de Conexión a Azure Databricks

* **Conector:** Azure Databricks Connector (Import / DirectQuery Mode)
* **Server Hostname:** `adb-7405616359428930.10.azuredatabricks.net`
* **HTTP Path:** `/sql/1.0/warehouses/cabc343c2bbc4249`
* **Catalog:** `dbw_cenepred_dev`
* **Schema:** `default`
* **Autenticación:** Personal Access Token (PAT)

---

## 2. Diagrama de Relaciones y Cardinalidad

```mermaid
erdiagram
    DIM_TIEMPO ||--o{ FACT_EMERGENCIAS : "1 a N (fecha_id)"
    DIM_REGION ||--o{ FACT_EMERGENCIAS : "1 a N (region_id)"
    DIM_FENOMENO ||--o{ FACT_EMERGENCIAS : "1 a N (fenomeno_id)"
    
    DIM_TIEMPO ||--o{ FACT_MONITOREO_DIARIO : "1 a N (fecha_id)"
    DIM_REGION ||--o{ FACT_MONITOREO_DIARIO : "1 a N (region_id)"
    
    DIM_TIEMPO ||--o{ FACT_PREDICCIONES : "1 a N (fecha_id)"
    DIM_REGION ||--o{ FACT_PREDICCIONES : "1 a N (region_id)"
    
    DIM_REGION ||--o{ FACT_GASTO_PREVAED : "1 a N (region_id)"
```

---

## 3. Matriz de Tablas y Atributos

### Tablas de Dimensión (Conformadas)

| Tabla | Clave Primaria | Atributos Clave | Rol en el Modelo |
|---|---|---|---|
| `DIM_TIEMPO` | `fecha_id` (YYYYMMDD) | `fecha`, `anio`, `mes`, `nombre_mes`, `trimestre`, `temporada`, `es_fin_semana` | Filtrado temporal e Inteligencia de Tiempo |
| `DIM_REGION` | `region_id` (1 a 25) | `departamento`, `ubigeo_departamento`, `region_natural` (Costa/Sierra/Selva), `latitud`, `longitud`, `cluster_riesgo` | Filtrado geoespacial y mapas |
| `DIM_FENOMENO` | `fenomeno_id` (INT) | `tipo_fenomeno_std`, `categoria_fenomeno` (Hidromet, Geodinámico, Biológico, etc.) | Categorización de eventos |

### Tablas de Hechos (Constelación)

| Tabla | Claves Foráneas | Métricas Principales | Grano de la Tabla |
|---|---|---|---|
| `FACT_EMERGENCIAS` | `fecha_id`, `region_id`, `fenomeno_id` | `cantidad_afectados`, `cantidad_damnificados`, `cantidad_fallecidos`, `viviendas_afectadas`, `severidad` | 1 fila por evento reportado por INDECI |
| `FACT_MONITOREO_DIARIO` | `fecha_id`, `region_id` | `temp_max`, `temp_min`, `precipitacion_mm`, `num_sismos_7d`, `magnitud_max_7d`, `num_focos_calor_activos` | 1 fila por Región × Día |
| `FACT_PREDICCIONES` | `fecha_id`, `region_id` | `probabilidad_riesgo`, `prediccion_binaria`, `modelo_usado` | 1 fila por Región × Día (Resultados XGBoost) |
| `FACT_GASTO_PREVAED` | `region_id` | `anio`, `monto_pim`, `monto_devengado`, `pct_ejecucion` | 1 fila por Región × Año (MEF PP 0068) |

> [!IMPORTANT]
> **Regla de Filtrado Cruzado para `FACT_GASTO_PREVAED`:**
> `FACT_GASTO_PREVAED` **NO** se conecta a `DIM_TIEMPO` mediante `fecha_id` porque su grano es anual, no diario. Se conecta a `DIM_REGION` por `region_id` y se filtra temporalmente mediante su columna nativa `anio`.

---

## 4. Configuración de Formato y Categorización de Datos en Power BI

1. **Campos Geográficos:**
   * `DIM_REGION[latitud]` → Data Category: **Latitude** (No resumir).
   * `DIM_REGION[longitud]` → Data Category: **Longitude** (No resumir).
   * `DIM_REGION[departamento]` → Data Category: **State or Province**.
2. **Campos de Fecha:**
   * Marcar `DIM_TIEMPO` como **Date Table** usando el campo `DIM_TIEMPO[fecha]`.
3. **Formatos Moneda y Porcentaje:**
   * Medidas de Gasto MEF → Formato Moneda Soles `S/ #,##0`.
   * Medidas de Porcentaje y Probabilidad → Formato Porcentaje `0.0%`.
