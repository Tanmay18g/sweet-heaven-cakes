#!/bin/bash
set -euo pipefail

RESOURCE_GROUP="rg-sweetheaven-cakes"
LOCATION="centralindia"
STORAGE_ACCOUNT="sweetheavencakes$(openssl rand -hex 3)"
SWA_NAME="sweet-heaven-cakes"

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "Set ADMIN_PASSWORD in your shell before running this script."
  exit 1
fi
if [ -z "${AZURE_SUBSCRIPTION_ID:-}" ]; then
  echo "Set AZURE_SUBSCRIPTION_ID in your shell before running this script."
  exit 1
fi

echo "Setting Azure subscription..."
az account set --subscription "$AZURE_SUBSCRIPTION_ID"

echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "Creating storage account: $STORAGE_ACCOUNT"
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true \
  --output none

STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query connectionString -o tsv)

echo "Creating blob container..."
az storage container create \
  --name sweetheaven \
  --connection-string "$STORAGE_CONNECTION" \
  --public-access blob \
  --output none

echo "Uploading default site config..."
az storage blob upload \
  --container-name sweetheaven \
  --name site-config.json \
  --file api/src/shared/defaultConfig.json \
  --connection-string "$STORAGE_CONNECTION" \
  --content-type application/json \
  --overwrite \
  --output none

echo "Creating Static Web App..."
az staticwebapp create \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Free \
  --output none 2>/dev/null || \
az staticwebapp create \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "eastasia" \
  --sku Free \
  --output none

echo "Configuring app settings..."
az staticwebapp appsettings set \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --setting-names \
    ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
    STORAGE_CONTAINER="sweetheaven" \
    AzureWebJobsStorage="$STORAGE_CONNECTION" \
  --output none

echo ""
echo "============================================"
echo "Azure resources created successfully!"
echo "============================================"
echo "Resource Group:    $RESOURCE_GROUP"
echo "Storage Account:   $STORAGE_ACCOUNT"
echo "Static Web App:    $SWA_NAME"
echo "Admin Dashboard:   https://<your-swa-url>/admin"
echo ""
echo "Next: Run deploy.sh to build and deploy the site"
echo "============================================"

# Save deployment info
cat > .azure-deploy.env <<EOF
RESOURCE_GROUP=$RESOURCE_GROUP
STORAGE_ACCOUNT=$STORAGE_ACCOUNT
SWA_NAME=$SWA_NAME
EOF
