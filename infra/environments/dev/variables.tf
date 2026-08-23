variable "location" {
  type    = string
  default = "eastus"
}

variable "resource_group_name" {
  type    = string
  default = "rg-cenepred-dev"
}

variable "storage_account_name" {
  type    = string
  default = "stcenepreddev1"
}

variable "data_factory_name" {
  type    = string
  default = "adf-cenepred-dev"
}

variable "databricks_workspace_name" {
  type    = string
  default = "dbw-cenepred-dev"
}

variable "key_vault_name" {
  type    = string
  default = "kv-cenepred-dev1"
}

variable "tags" {
  type = map(string)
  default = {
    Environment = "dev"
    Project     = "CENEPRED SAT BI"
    ManagedBy   = "Terraform"
  }
}
