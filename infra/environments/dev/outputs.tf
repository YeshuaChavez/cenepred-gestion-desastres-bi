output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "storage_account_name" {
  value = module.lakehouse.name
}

output "storage_dfs_endpoint" {
  value = module.lakehouse.primary_dfs_endpoint
}

output "data_factory_name" {
  value = module.data_factory.name
}

output "data_factory_principal_id" {
  value = module.data_factory.principal_id
}

output "databricks_workspace_url" {
  value = module.databricks.workspace_url
}

output "key_vault_uri" {
  value = module.key_vault.vault_uri
}
