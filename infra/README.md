# Infraestructura como código (Terraform)

Define de forma declarativa todos los recursos de Azure del proyecto: ADF, ADLS Gen2, Databricks,
Synapse Serverless SQL Pool, Key Vault, Purview, Azure Machine Learning, Entra ID (RBAC), Monitor +
Log Analytics y Cost Management + Budgets (ver sección 6 y 7.1 del informe).

- `modules/` — un módulo Terraform por servicio de Azure, reutilizable entre entornos.
- `environments/dev|test|prod/` — configuración específica de cada entorno (tfvars, backend remoto),
  cada uno consumiendo los módulos de `modules/`.

Flujo de CI/CD: `terraform validate/plan` en el build, `terraform apply` en el deploy (ver
`.github/workflows/`).
