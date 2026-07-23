# Sistema de Alerta Temprana de Riesgo Dinámico ante Emergencias Climáticas en el Perú

Proyecto del curso de Inteligencia de Negocios (UNMSM) que integra el histórico oficial de
emergencias de INDECI con fuentes de monitoreo activo (Open-Meteo, USGS, NASA FIRMS) mediante una
arquitectura Lakehouse Medallion en Azure, con un componente descriptivo (Power BI) y uno
predictivo (Machine Learning), pensado como complemento del sistema SIGRID de CENEPRED.

Diseño completo, gobernanza de datos, arquitectura, metas cuantitativas y componentes analíticos:
ver [`docs/Informe_Final_Proyecto_BI.docx`](docs/Informe_Final_Proyecto_BI.docx).

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `infra/` | Infraestructura como código (Terraform) para todos los recursos de Azure |
| `data/` | Lakehouse completo: `ingestion/`, `pipelines/` (ADF) y las capas Medallion `bronze/` → `silver/` → `gold/`, más `quality/` (Great Expectations) |
| `ml/` | Componente predictivo (`training/`, `evaluation/`, `inference/`), consume `data/gold/` |
| `apps/` | Capa de consumo final: `dashboards/` (los cinco de Power BI), `chatbot/` (RAG) y `webapp/` |
| `docs/` | Informe del proyecto y material de referencia |
| `tests/` | Pruebas unitarias e de integración |
| `scripts/` | Utilidades de desarrollo local |
| `.github/workflows/` | Pipelines de CI/CD (build, test, deploy) |

## Entornos

Dev → Test/QA → Prod, desplegados vía Terraform con promoción manual/aprobada (ver sección 7 del informe).
