resource "azurerm_storage_account" "ecomm_storage" {
  name                     = "sit722devopsteddystorage"
  resource_group_name      = azurerm_resource_group.my_resource_group.name
  location                 = azurerm_resource_group.my_resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

output "storage_account_name" {
  value = azurerm_storage_account.ecomm_storage.name
}

output "storage_account_key" {
  value     = azurerm_storage_account.ecomm_storage.primary_access_key
  sensitive = true
}
