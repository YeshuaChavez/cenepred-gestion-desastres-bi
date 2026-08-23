# Módulo: Workspace de Azure Databricks.
# SKU premium: necesario para Unity Catalog, control de acceso y secret scopes respaldados
# por Key Vault (los que consume el job diario del pipeline).

variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "sku" {
  type    = string
  default = "premium"
}
variable "tags" {
  type    = map(string)
  default = {}
}

resource "azurerm_databricks_workspace" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  tags                = var.tags
}

output "id" { value = azurerm_databricks_workspace.this.id }
output "name" { value = azurerm_databricks_workspace.this.name }
output "workspace_url" { value = azurerm_databricks_workspace.this.workspace_url }
