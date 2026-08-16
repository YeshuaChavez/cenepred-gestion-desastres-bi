# ==============================================================================
# TERRAFORM IAC — AZURE INFRASTRUCTURE FOR CENEPRED BI & AZURE DATA FACTORY
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 1. Resource Group
resource "azurerm_resource_group" "rg_cenepred" {
  name     = "rg-cenepred-bi-prod"
  location = "eastus2"

  tags = {
    Environment = "Production"
    Project     = "CENEPRED SAT BI"
    ManagedBy   = "Terraform"
  }
}

# 2. ADLS Gen2 Storage Account (Bronze, Silver, Gold Containers)
resource "azurerm_storage_account" "st_cenepred" {
  name                     = "stcenepredbiprod"
  resource_group_name      = azurerm_resource_group.rg_cenepred.name
  location                 = azurerm_resource_group.rg_cenepred.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  is_hns_enabled           = true

  tags = azurerm_resource_group.rg_cenepred.tags
}

resource "azurerm_storage_container" "container_bronze" {
  name                  = "bronze"
  storage_account_name  = azurerm_storage_account.st_cenepred.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "container_silver" {
  name                  = "silver"
  storage_account_name  = azurerm_storage_account.st_cenepred.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "container_gold" {
  name                  = "gold"
  storage_account_name  = azurerm_storage_account.st_cenepred.name
  container_access_type = "private"
}

# 3. Azure Data Factory (ADF)
resource "azurerm_data_factory" "adf_cenepred" {
  name                = "adf-cenepred-prod"
  location            = azurerm_resource_group.rg_cenepred.location
  resource_group_name = azurerm_resource_group.rg_cenepred.name

  identity {
    type = "SystemAssigned"
  }

  tags = azurerm_resource_group.rg_cenepred.tags
}

# 4. Azure Key Vault
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv_cenepred" {
  name                        = "kv-cenepred-prod"
  location                    = azurerm_resource_group.rg_cenepred.location
  resource_group_name         = azurerm_resource_group.rg_cenepred.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"

  tags = azurerm_resource_group.rg_cenepred.tags
}

# Outputs
output "resource_group_name" {
  value = azurerm_resource_group.rg_cenepred.name
}

output "storage_account_name" {
  value = azurerm_storage_account.st_cenepred.name
}

output "data_factory_name" {
  value = azurerm_data_factory.adf_cenepred.name
}
