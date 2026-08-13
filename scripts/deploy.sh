#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ -f .azure-deploy.env ]; then
  source .azure-deploy.env
else
  echo "Run scripts/setup-azure.sh first"
  exit 1
fi

echo "Installing frontend dependencies..."
npm install

echo "Installing API dependencies..."
cd api && npm install && cd ..

echo "Building frontend..."
npm run build

echo "Deploying to Azure Static Web App..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.apiKey" -o tsv)

npx --yes @azure/static-web-apps-cli deploy \
  --deployment-token "$DEPLOYMENT_TOKEN" \
  --env production \
  --app-location "." \
  --output-location "dist" \
  --api-location "api" \
  --api-language "node" \
  --api-version "20"

SWA_URL=$(az staticwebapp show \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "defaultHostname" -o tsv)

echo ""
echo "============================================"
echo "Deployment complete!"
echo "============================================"
echo "Website:  https://$SWA_URL"
echo "Admin:    https://$SWA_URL/admin"
echo "============================================"
