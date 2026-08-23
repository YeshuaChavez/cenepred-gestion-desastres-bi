# ==============================================================================
# Entorno DEV de CENEPRED BI, compuesto a partir de los módulos de infra/modules.
#
# NOTA DE ADOPCIÓN: los recursos dev ya existen (se crearon de forma imperativa). Para que
# Terraform los gestione sin recrearlos, hay que importarlos una vez (ver infra/README.md,
# sección "Adoptar infraestructura existente"). En un entorno nuevo, `apply` los crea.
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

module "lakehouse" {
  source              = "../../modules/lakehouse_storage"
  name                = var.storage_account_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tags                = var.tags
}

module "data_factory" {
  source              = "../../modules/data_factory"
  name                = var.data_factory_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tags                = var.tags
}

module "databricks" {
  source              = "../../modules/databricks"
  name                = var.databricks_workspace_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tags                = var.tags
}

module "key_vault" {
  source              = "../../modules/key_vault"
  name                = var.key_vault_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = var.tags

  # Quién puede LEER secretos: la identidad de ADF y el propio usuario que despliega.
  secret_reader_principal_ids = {
    data_factory = module.data_factory.principal_id
    deployer     = data.azurerm_client_config.current.object_id
  }
}

# La identidad de ADF puede leer/escribir el data lake (Bronze/Silver/Gold).
resource "azurerm_role_assignment" "adf_storage_contributor" {
  scope                = module.lakehouse.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = module.data_factory.principal_id
}
