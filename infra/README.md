# Infraestructura como código (Terraform)

Define de forma declarativa la plataforma de datos de Azure del proyecto: grupo de recursos,
ADLS Gen2 (Bronze/Silver/Gold), Azure Data Factory, Azure Databricks y Key Vault, con las
asignaciones de rol que las conectan.

## Estructura

```
infra/
  modules/                    módulos reutilizables, uno por servicio
    lakehouse_storage/        Storage Account ADLS Gen2 + contenedores
    data_factory/             ADF con identidad administrada
    databricks/               workspace de Databricks
    key_vault/                Key Vault (RBAC) + roles de lectura + secretos opcionales
  environments/
    dev/                      compone los módulos con los nombres reales de dev
    prod/                     igual que dev, con nombres de producción
    test/                     (reservado)
  azure_data_factory/         definiciones JSON del pipeline, trigger y linked services de ADF
  azure_ml/                   despliegue del endpoint del modelo (ver más abajo)
  databricks/                 notebook del job diario
```

> Azure Machine Learning **no** se gestiona desde aquí: tiene su propio flujo en
> `infra/azure_ml/deploy_aml_endpoint.py` (registra el modelo como carpeta autocontenida y crea
> el managed online endpoint). Ver la sección de Azure ML del README raíz.

## Aplicar (entorno nuevo)

```bash
cd infra/environments/dev      # o prod
terraform init
terraform validate
terraform plan
terraform apply
```

Requiere Azure CLI con sesión iniciada (`az login`) y permisos suficientes en la suscripción.

## Adoptar infraestructura existente

Los recursos de `dev` ya existen (se crearon de forma imperativa), así que un `apply` en limpio
chocaría con nombres globales ya usados (Storage Account, Key Vault). Para que Terraform los
gestione sin recrearlos, impórtalos una vez. Ejemplo:

```bash
cd infra/environments/dev
terraform init
SUB=$(az account show --query id -o tsv)

terraform import azurerm_resource_group.rg \
  "/subscriptions/$SUB/resourceGroups/rg-cenepred-dev"

terraform import module.lakehouse.azurerm_storage_account.this \
  "/subscriptions/$SUB/resourceGroups/rg-cenepred-dev/providers/Microsoft.Storage/storageAccounts/stcenepreddev1"

terraform import module.data_factory.azurerm_data_factory.this \
  "/subscriptions/$SUB/resourceGroups/rg-cenepred-dev/providers/Microsoft.DataFactory/factories/adf-cenepred-dev"

terraform import module.key_vault.azurerm_key_vault.this \
  "/subscriptions/$SUB/resourceGroups/rg-cenepred-dev/providers/Microsoft.KeyVault/vaults/kv-cenepred-dev1"
```

Luego `terraform plan` debe mostrar cambios mínimos (solo diferencias reales).

## Key Vault: fuente única de secretos

El Key Vault usa **autorización RBAC**. El módulo `key_vault` concede el rol *Key Vault Secrets
User* (lectura) a las identidades que le pases en `secret_reader_principal_ids` (por defecto, la
identidad de ADF y el usuario que despliega).

Para **cargar** secretos necesitas el rol *Key Vault Secrets Officer* sobre el vault:

```bash
VAULT=kv-cenepred-dev1
ME=$(az ad signed-in-user show --query id -o tsv)
az role assignment create --assignee "$ME" \
  --role "Key Vault Secrets Officer" \
  --scope "$(az keyvault show -n $VAULT --query id -o tsv)"

# Ejemplos de secretos que consume el proyecto:
az keyvault secret set --vault-name $VAULT --name adls-key       --value "<storage-key>"
az keyvault secret set --vault-name $VAULT --name nasa-firms-key --value "<map-key>"
az keyvault secret set --vault-name $VAULT --name telegram-bot-token --value "<token>"
```

El código Python lee estos secretos con `common/secrets.py`, que se autentica con
`DefaultAzureCredential` (identidad administrada en ADF/Databricks/Azure ML, o `az login` en
local). Para activarlo basta exponer el vault por entorno:

```bash
export KEY_VAULT_URI="https://kv-cenepred-dev1.vault.azure.net"
```

Si esa variable no está, o el secreto falta, el helper cae a la variable de entorno equivalente
(p.ej. `AZURE_STORAGE_KEY`), de modo que el desarrollo local y el GitHub Action siguen igual.

Para Databricks, la vía recomendada es un **secret scope respaldado por Key Vault**, de modo que
`dbutils.secrets.get("cenepred", "adls-key")` lea directo del vault:

```bash
# desde la Databricks CLI, apuntando el scope al Key Vault
databricks secrets create-scope cenepred \
  --scope-backend-type AZURE_KEYVAULT \
  --resource-id "$(az keyvault show -n kv-cenepred-dev1 --query id -o tsv)" \
  --dns-name "https://kv-cenepred-dev1.vault.azure.net/"
```

## Nota de validación

Estos módulos se escribieron para el provider `azurerm ~> 3.90`. Ejecuta `terraform init` y
`terraform validate` en tu entorno antes de `plan/apply` (el binario de Terraform no está incluido
en el repo).
