# Especificación Visual de los 5 Dashboards de Power BI

Este documento detalla la estructura, maquetación visual, paleta de colores y componentes analíticos de los **5 dashboards** del Sistema de Alerta Temprana de CENEPRED.

---

## Paleta de Colores y Estilo Visual

* **Modo de Diseño:** Dark / Navy Slate Theme (Modern Executive Dashboard)
* **Color Primario (Riesgo Alto / Alerta):** `#E63946` (Rojo Carmesí)
* **Color Secundario (Riesgo Moderado):** `#F4A261` (Naranja Cálido)
* **Color Neutro / Normal (Riesgo Bajo):** `#2A9D8F` (Verde Esmeralda)
* **Color Fondos de Tarjetas / KPI:** `#1E293B` (Azul Oscuro Slate)
* **Fondo Principal Canvas:** `#0F172A` (Azul Noche Premium)
* **Tipografía:** Inter / Segoe UI (Limpia y legible)

---

## Dashboard 1: Monitoreo Diario de Riesgo y Actividad

* **Objetivo:** Visualizar el estado activo del clima, actividad sísmica y focos de calor satelitales en el territorio nacional.

### Disposición del Canvas (Layout Grid 16:9)

1. **Header Top:** Título del Reporte + Logo CENEPRED + Tarjeta con Fecha de Última Actualización + Slicers (Región Natural, Departamento).
2. **Fila Superior de KPIs Cards (4 Tarjetas):**
   * `Temp Maxima Promedio (°C)`
   * `Precipitacion Acumulada (mm)`
   * `Total Focos Calor Activos`
   * `Total Sismos 7d` (con indicador de `Magnitud Sismica Maxima`)
3. **Sección Central Izquierda (Mapa de Calor):**
   * **Visual:** Bubble Map (Mapa de Puntos).
   * **Configuración:** `Latitude` = `DIM_REGION[latitud]`, `Longitude` = `DIM_REGION[longitud]`, `Bubble Size` = `[Precipitacion Acumulada (mm)]`, `Color Legend` = `DIM_REGION[region_natural]`.
4. **Sección Central Derecha (Serie Temporal Diaria):**
   * **Visual:** Combo Chart (Barras de Precipitación mm + Línea de Temperatura Máx °C).
   * **Eje X:** `DIM_TIEMPO[fecha]`.
5. **Fila Inferior (Tabla de Alerta por Región):**
   * Región | Precipitación (mm) | Focos de Calor Activos | Sismos 7d | Magnitud Máx | Estado de Alerta.

---

## Dashboard 2: Histórico de Emergencias y Tendencias Multianuales

* **Objetivo:** Analizar la evolución multianual (2012-2023) del daño causado por emergencias climáticas.

### Disposición del Canvas

1. **Slicers Superiores:** Año, Mes, Categoria Fenómeno, Departamento.
2. **KPIs Cards Principales:**
   * `Total Emergencias` (con KPI YoY `% Variacion YoY Emergencias`)
   * `Total Afectados` (con KPI YoY `% Variacion YoY Afectados`)
   * `Total Damnificados`
   * `Total Viviendas Destruidas`
3. **Visual Principal (Evolución Mensual Comparativa YoY):**
   * **Visual:** Area Chart / Line Chart.
   * **Eje X:** `DIM_TIEMPO[nombre_mes]`.
   * **Valores:** `[Total Emergencias]` vs `[Emergencias Año Anterior (PY)]`.
4. **Visual Secundario (Top Fenómenos más Recurrentes):**
   * **Visual:** Horizontal Bar Chart.
   * **Eje Y:** `DIM_FENOMENO[tipo_fenomeno_std]`.
   * **Eje X:** `[Total Emergencias]` / `[Total Afectados]`.

---

## Dashboard 3: Riesgo Dinámico Predictivo y Explicabilidad (ML + SHAP)

* **Objetivo:** Presentar las predicciones del modelo XGBoost y justificar el riesgo mediante explicabilidad SHAP.

### Disposición del Canvas

1. **Filtros de Control Predictivo:** Slider de Umbral de Probabilidad (% Riesgo), Cluster K-Means, Departamento.
2. **KPI Cards Predictivas:**
   * `Regiones Alto Riesgo Count` (Riesgo ≥ 70%)
   * `Probabilidad Riesgo Promedio (%)`
   * `Cluster de Mayor Vulnerabilidad`
3. **Mapa Coroplético de Alerta Temprana (Izquierda):**
   * **Visual:** Map / Filled Map.
   * **Color Gradient:** Verde (Bajo Riesgo) → Amarillo (Moderado) → Rojo Intenso (Probabilidad ≥ 70%).
4. **Waterfall Chart / Bar Chart de Explicabilidad SHAP (Derecha):**
   * Muestra las variables predictoras clave que impulsan el score de riesgo para la región seleccionada (ej. Racha de precipitación 7d, anomalía climática, densidad de focos de calor).

---

## Dashboard 4: Comparativo Regional y Matriz Estacional

* **Objetivo:** Evaluar la concentración estacional y realizar ranking entre departamentos.

### Disposición del Canvas

1. **Heatmap Matriz (Región × Mes):**
   * **Filas:** `DIM_REGION[departamento]`.
   * **Columnas:** `DIM_TIEMPO[nombre_mes]`.
   * **Valores:** `[Total Emergencias]` o `[Indice Severidad Promedio]`.
   * **Formato Condicional:** Gradiente de color según severidad.
2. **Ranking Divergente de Regiones:**
   * Bar Chart horizontal ordenado por `[Severidad Ponderada Regional]`.
3. **Scatter Plot (Resiliencia vs Daño):**
   * **Eje X:** `Total Afectados`.
   * **Eje Y:** `Total Damnificados`.
   * **Detalle:** `DIM_REGION[departamento]`.

---

## Dashboard 5: Impacto Socioeconómico y Gestión Presupuestal (MEF PP 0068)

* **Objetivo:** Evaluar la efectividad del gasto ejecutado en el Programa Presupuestal PP 0068 (PREVAED) frente a las emergencias sufridas.

### Disposición del Canvas

1. **Slicers:** Año (2012-2023), Departamento.
2. **KPI Cards Financieras:**
   * `Presupuesto PIM Total (S/.)`
   * `Presupuesto Devengado Total (S/.)`
   * `Porcentaje Ejecucion Presupuestal (%)`
   * `Costo Presupuestal por Afectado (S/.)`
3. **Gráfico Combinado Presupuesto vs Emergencias:**
   * **Barras:** `[Presupuesto Devengado Total (S/.)]`.
   * **Línea:** `[Total Emergencias]` o `[Total Personas Impactadas]`.
4. **Tabla Matriz de Ejecución por Departamento:**
   * Departamento | PIM (S/.) | Devengado (S/.) | % Ejecución | Personas Afectadas | Viviendas Destruidas.
