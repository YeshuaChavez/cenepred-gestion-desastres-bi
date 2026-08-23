# Módulo: Azure Key Vault como fuente única de secretos, con autorización RBAC.
#
# - enable_rbac_authorization = true: los permisos se dan por roles de Azure (no por access
#   policies), que es el modelo que consume common/secrets.py vía DefaultAzureCredential.
# - secret_reader_principal_ids: identidades (ADF, Databricks, el usuario) a las que se les
#   concede "Key Vault Secrets User" (lectura de secretos).
#
# Los VALORES de los secretos NO se gestionan desde Terraform a propósito: meterlos aquí los
# dejaría en texto plano en el state. Se cargan aparte con `az keyvault secret set`
# (ver infra/README.md).

variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tenant_id" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}
variable "secret_reader_principal_ids" {
  type        = map(string)
  default     = {}
  description = "Mapa etiqueta -> objectId de las identidades que podrán LEER secretos."
}

resource "azurerm_key_vault" "this" {
  name                       = var.name
  resource_group_name        = var.resource_group_name
  location                   = var.location
  tenant_id                  = var.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  tags                       = var.tags
}

resource "azurerm_role_assignment" "secrets_user" {
  for_each             = var.secret_reader_principal_ids
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = each.value
}

output "id" { value = azurerm_key_vault.this.id }
output "vault_uri" { value = azurerm_key_vault.this.vault_uri }
