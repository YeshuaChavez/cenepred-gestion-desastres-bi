variable "location" {
  type    = string
  default = "eastus2"
}

variable "resource_group_name" {
  type    = string
  default = "rg-cenepred-bi-prod"
}

variable "storage_account_name" {
  type    = string
  default = "stcenepredbiprod"
}

variable "data_factory_name" {
  type    = string
  default = "adf-cenepred-prod"
}

variable "databricks_workspace_name" {
  type    = string
  default = "dbw-cenepred-prod"
}

variable "key_vault_name" {
  type    = string
  default = "kv-cenepred-prod"
}

variable "tags" {
  type = map(string)
  default = {
    Environment = "Production"
    Project     = "CENEPRED SAT BI"
    ManagedBy   = "Terraform"
  }
}
