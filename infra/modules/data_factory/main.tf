# Módulo: Azure Data Factory con identidad administrada asignada por el sistema.
# La identidad (principal_id de salida) es la que se autoriza en ADLS y Key Vault, y la que
# usa la Web activity del pipeline para disparar el job de Databricks como propietario.

variable "name" { type = string }
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}

resource "azurerm_data_factory" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

output "id" { value = azurerm_data_factory.this.id }
output "name" { value = azurerm_data_factory.this.name }
output "principal_id" { value = azurerm_data_factory.this.identity[0].principal_id }
