# Sweet Heaven — Premium Custom Cakes Website

Luxury custom cake business website with a Super Admin dashboard, hosted on Azure **free tier**.

## Live URLs

| Resource | URL |
|----------|-----|
| **Website** | https://black-tree-0a6f82600.7.azurestaticapps.net |
| **Admin Dashboard** | https://black-tree-0a6f82600.7.azurestaticapps.net/admin |
| **Site Config (JSON)** | https://sweetheavencakes33f687.blob.core.windows.net/sweetheaven/site-config.json |

## Admin Login

The admin password is stored only in the Azure Static Web App `ADMIN_PASSWORD`
application setting. Never add it to a `VITE_*` variable: Vite embeds those
values in the public browser bundle.

## Cost-Optimized Architecture (~$0–2/month)

| Service | Tier | Cost |
|---------|------|------|
| **Azure Static Web Apps** | Free | $0 — 100 GB bandwidth, SSL, custom domains |
| **Storage Account** | Standard LRS | ~$0.02/GB — one account for site config JSON |
| **Enquiries** | WhatsApp redirect | $0 — no backend needed |
| **Function App** | Removed | Was ~$0–5/mo with App Insights |

**Removed to save cost:** standalone Function App, Application Insights, 2 unused storage accounts.

## Saving Admin Changes

1. Edit in `/admin` → **Save Changes** (downloads JSON automatically)
2. Upload to Azure Blob:

```bash
bash scripts/upload-config.sh site-config.json
```

## Enquiries

Quote forms open **WhatsApp** with a pre-filled message — no server cost.

## Azure Resources

| Resource | Name |
|----------|------|
| Resource Group | `rg-sweetheaven-cakes` |
| Static Web App | `sweet-heaven-cakes` (Free) |
| Storage Account | `sweetheavencakes33f687` (LRS) |

## Local Development

```bash
npm install && npm run dev
cd api && func start   # optional — for local API testing
```

Set a local-only `ADMIN_PASSWORD` value in `api/local.settings.json` before
testing the admin API. This file is ignored by Git.

## Redeploy

```bash
npm run build && cp staticwebapp.config.json dist/
source .azure-deploy.env
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name "$SWA_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.apiKey" -o tsv)
npx @azure/static-web-apps-cli deploy --deployment-token "$DEPLOYMENT_TOKEN" --output-location dist
```
