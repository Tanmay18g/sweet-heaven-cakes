#!/bin/bash
# Upload site config to Azure Blob Storage (run after editing in admin export)
set -euo pipefail
cd "$(dirname "$0")/.."
source .azure-deploy.env 2>/dev/null || true
STORAGE_ACCOUNT="${STORAGE_ACCOUNT:-sweetheaven2078f6}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-autoapply-dev}"
CONFIG_FILE="${1:-api/shared/defaultConfig.json}"
CONN=$(az storage account show-connection-string --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" --query connectionString -o tsv)
az storage blob upload \
  --container-name sweetheaven \
  --name site-config.json \
  --file "$CONFIG_FILE" \
  --connection-string "$CONN" \
  --content-type application/json \
  --overwrite
echo "Config uploaded to https://${STORAGE_ACCOUNT}.blob.core.windows.net/sweetheaven/site-config.json"
