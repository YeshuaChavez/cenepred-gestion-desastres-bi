# Módulo: Storage Account ADLS Gen2 (Data Lake) con contenedores Bronze/Silver/Gold.

variable "name" {
  type        = string
  description = "Nombre global del Storage Account (3-24, minúsculas y dígitos)."
}
variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}
variable "containers" {
  type    = list(string)
  default = ["bronze", "silver", "gold"]
}

resource "azurerm_storage_account" "this" {
  name                     = var.name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  is_hns_enabled           = true # habilita jerarquía de namespace = ADLS Gen2
  min_tls_version          = "TLS1_2"
  tags                     = var.tags
}

resource "azurerm_storage_container" "this" {
  for_each              = toset(var.containers)
  name                  = each.value
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"
}

output "id" { value = azurerm_storage_account.this.id }
output "name" { value = azurerm_storage_account.this.name }
output "primary_dfs_endpoint" { value = azurerm_storage_account.this.primary_dfs_endpoint }
