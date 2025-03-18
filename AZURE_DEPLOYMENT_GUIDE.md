
# Azure Deployment Guide for Travel Insurance Application

This document provides comprehensive instructions for deploying the Travel Insurance application on Azure Cloud, with detailed examples for those new to Azure.

## Prerequisites

- Azure account with active subscription (Sign up at [portal.azure.com](https://portal.azure.com) if you don't have one)
- Azure CLI installed ([Download here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- GitHub account for source code repository
- Node.js and npm installed for front-end development
- Maven installed for Java backend development

## Step 1: Create an Azure Resource Group

A resource group is a container that holds related resources. Start by creating one for all your project resources:

```bash
# Login to Azure CLI
az login

# Create a resource group
az group create --name travel-insurance-rg --location eastus
```

## Step 2: Set Up Azure MySQL Database

1. Create an Azure MySQL database:

```bash
# Create MySQL server
az mysql server create \
  --resource-group travel-insurance-rg \
  --name travel-insurance-mysql \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourStrongPassword123! \
  --sku-name GP_Gen5_2

# Note: Replace 'YourStrongPassword123!' with a strong password
```

2. Configure firewall rules to allow Azure services:

```bash
# Allow access from Azure services
az mysql server firewall-rule create \
  --resource-group travel-insurance-rg \
  --server travel-insurance-mysql \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow access from your development machine (optional)
az mysql server firewall-rule create \
  --resource-group travel-insurance-rg \
  --server travel-insurance-mysql \
  --name AllowMyIP \
  --start-ip-address <your-ip-address> \
  --end-ip-address <your-ip-address>
```

3. Create the database:

```bash
# Create a database
az mysql db create \
  --resource-group travel-insurance-rg \
  --server-name travel-insurance-mysql \
  --name insurancedb
```

4. Connect to the database and execute the schema creation script:

```bash
# Connect to MySQL (you might need MySQL client installed)
mysql -h travel-insurance-mysql.mysql.database.azure.com -u adminuser@travel-insurance-mysql -p

# Once connected, execute the schema script from src/db/mysql_migration.sql
```

## Step 3: Set Up Azure AD B2C for Authentication

### Create Azure AD B2C Tenant

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Azure AD B2C" and select it
3. Click "Create a new Azure AD B2C Tenant"
4. Fill in the required information:
   - Organization name (e.g., "TravelInsurance")
   - Initial domain name (e.g., "travelinsurance" - this will become travelinsurance.onmicrosoft.com)
   - Country/Region (select your location)
   - Resource group (use the existing travel-insurance-rg)
5. Click "Review + create" and then "Create"

### Register Your Application

1. In your new B2C tenant, go to "App registrations"
2. Click "New registration"
3. Enter application details:
   - Name: "Travel Insurance App"
   - Supported account types: "Accounts in any identity provider or organizational directory"
   - Redirect URI: Select "Web" and enter your frontend URL (e.g., https://travel-insurance-app.azurestaticapps.net)
   - Click "Register"
4. Note the "Application (client) ID" - you'll need this later

### Configure User Flows

1. Go to "Azure AD B2C" > "User flows"
2. Click "New user flow"
3. Select "Sign up and sign in"
4. Select "Recommended" and click "Create"
5. Provide a name (e.g., "B2C_1_signupsignin")
6. Under "Identity providers", select "Email signup"
7. Under "User attributes", select:
   - Email Address
   - Given Name
   - Display Name
   - Surname
8. Click "Create"

### Configure Google Authentication (Optional)

1. First, create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or use an existing one
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Travel Insurance App"
   - Authorized redirect URIs: Add "https://your-b2c-tenant.b2clogin.com/your-b2c-tenant.onmicrosoft.com/oauth2/authresp"
   - Note the Client ID and Client Secret

2. In Azure AD B2C:
   - Go to "Identity providers"
   - Select "Google"
   - Name: "Google"
   - Client ID: (paste from Google)
   - Client secret: (paste from Google)
   - Click "Save"

3. Update your user flow to include Google:
   - Go to your user flow (B2C_1_signupsignin)
   - Under "Identity providers", select both "Email signup" and "Google"
   - Click "Save"

## Step 4: Deploy Azure Functions (Java Backend)

1. Navigate to the Azure Functions project:

```bash
cd src/azure-functions/travelInsuranceApi
```

2. Build the project:

```bash
mvn clean package
```

3. Create an Azure Function App:

```bash
# Create storage account for Function App
az storage account create \
  --name travelinsurancestorage \
  --resource-group travel-insurance-rg \
  --location eastus \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --storage-account travelinsurancestorage \
  --runtime java \
  --runtime-version 11 \
  --functions-version 4 \
  --os-type Linux \
  --consumption-plan-location eastus
```

4. Configure environment variables:

```bash
# MySQL connection string
az functionapp config appsettings set \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --settings MYSQL_CONNECTION_STRING="jdbc:mysql://travel-insurance-mysql.mysql.database.azure.com:3306/insurancedb?useSSL=true&serverTimezone=UTC"

# MySQL credentials
az functionapp config appsettings set \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --settings MYSQL_USER="adminuser@travel-insurance-mysql"

az functionapp config appsettings set \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --settings MYSQL_PASSWORD="YourStrongPassword123!"

# Azure AD B2C settings
az functionapp config appsettings set \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --settings AZURE_AD_B2C_TENANT="your-tenant-name.onmicrosoft.com"

az functionapp config appsettings set \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --settings AZURE_AD_B2C_CLIENT_ID="your-application-client-id"
```

5. Deploy the functions:

```bash
mvn azure-functions:deploy
```

6. Configure Authentication Settings (Optional for protected endpoints):

   Some endpoints like getting quotes are configured to allow anonymous access so that users can browse quotes without signing in. For other endpoints that require authentication:

   - Go to Azure Portal > Your Function App > Authentication
   - Click "Add identity provider"
   - Select "Microsoft" as the identity provider
   - Under App registration type, select "Pick an existing app registration in this directory"
   - Select your Azure AD B2C app registration 
   - For Issuer URL, enter: `https://your-tenant-name.b2clogin.com/your-tenant-name.onmicrosoft.com/B2C_1_signupsignin/v2.0`
   - Click "Add"

## Step 5: Configure CORS for Azure Functions

CORS (Cross-Origin Resource Sharing) configuration is critical to allow your frontend to communicate with your Azure Functions. Here's how to properly configure it:

```bash
# Configure CORS for Azure Functions using Azure CLI
az functionapp cors add \
  --name travel-insurance-api \
  --resource-group travel-insurance-rg \
  --allowed-origins "https://travel-insurance-app.azurestaticapps.net" "https://lively-smoke-0eae5a610.azurestaticapps.net" "*"
```

Additionally, verify that the `host.json` file in your Azure Function app includes proper CORS configuration:

```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[1.*, 2.0.0)"
  },
  "cors": {
    "allowedOrigins": [
      "https://lively-smoke-0eae5a610.azurestaticapps.net",
      "http://localhost:3000",
      "http://localhost:5173",
      "*"
    ],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["*"],
    "allowCredentials": true,
    "maxAge": 86400
  }
}
```

Ensure that your function code also includes the appropriate CORS headers in the response:

```java
// Example CORS headers in Java Function
Map<String, String> corsHeaders = new HashMap<>();
corsHeaders.put("Access-Control-Allow-Origin", "*");
corsHeaders.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
corsHeaders.put("Access-Control-Allow-Headers", "Content-Type, Authorization");
corsHeaders.put("Access-Control-Max-Age", "86400");

return request
    .createResponseBuilder(HttpStatus.OK)
    .headers(corsHeaders)
    .body(resultData)
    .build();
```

Important: Your Azure Function should handle OPTIONS preflight requests by returning a 200 OK response with the appropriate CORS headers.

## Step 6: Deploy Front-end to Azure Static Web Apps

1. Create a GitHub repository and push your code

2. Create an Azure Static Web App through the Azure Portal:
   - Go to [Azure Portal](https://portal.azure.com)
   - Search for "Static Web Apps" and select it
   - Click "Create"
   - Fill in the details:
     - Subscription: Your subscription
     - Resource Group: travel-insurance-rg
     - Name: travel-insurance-app
     - Region: Select nearest region
     - SKU: Free
     - Source: GitHub
     - Organization: Your GitHub organization
     - Repository: Your repository
     - Branch: main
     - Build Presets: React
     - App location: /
     - Api location: (leave empty)
     - Output location: dist
   - Click "Review + create" and then "Create"

3. After deployment, configure the environment variables in the Azure Portal:
   - Go to your Static Web App > "Configuration"
   - Add the following application settings one by one:

   | Name | Value | Example |
   |------|-------|---------|
   | VITE_AZURE_AD_CLIENT_ID | Your Azure AD B2C application client ID | 12345678-1234-1234-1234-1234567890ab |
   | VITE_AZURE_AD_AUTHORITY | Your Azure AD B2C authority URL | https://travelinsurance.b2clogin.com/travelinsurance.onmicrosoft.com/B2C_1_signupsignin |
   | VITE_AZURE_AD_REDIRECT_URI | Your frontend URL | https://travel-insurance-app.azurestaticapps.net |
   | VITE_AZURE_AD_KNOWN_AUTHORITY | Your B2C tenant login domain | travelinsurance.b2clogin.com |
   | VITE_AZURE_AD_SCOPE | Your API scope | https://travelinsurance.onmicrosoft.com/api/user_impersonation |
   | VITE_AZURE_FUNCTION_URL | URL of your Azure Functions | https://travel-insurance-api.azurewebsites.net/api |

   - Click "Save" after adding all environment variables

### Environment Variables Explained

#### Azure AD B2C Variables

1. **VITE_AZURE_AD_CLIENT_ID**: The Application (client) ID of your registered app in Azure AD B2C.
   - Example: `12345678-1234-1234-1234-1234567890ab`
   - Where to find: Azure Portal > Azure AD B2C > App registrations > Your app > Overview > Application (client) ID

2. **VITE_AZURE_AD_AUTHORITY**: The full authority URL, including your tenant name and policy name.
   - Format: `https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}`
   - Example: `https://travelinsurance.b2clogin.com/travelinsurance.onmicrosoft.com/B2C_1_signupsignin`
   - Where to find: Azure Portal > Azure AD B2C > User flows > Click on your flow

3. **VITE_AZURE_AD_REDIRECT_URI**: The URL where users will be redirected after authentication.
   - Example: `https://travel-insurance-app.azurestaticapps.net`
   - This should match the redirect URI configured in your app registration

4. **VITE_AZURE_AD_KNOWN_AUTHORITY**: Just the domain portion of your B2C tenant.
   - Example: `travelinsurance.b2clogin.com`
   - This is the first part of your authority URL

5. **VITE_AZURE_AD_SCOPE**: The API permission scope you defined for your application.
   - Format: `https://{tenant}.onmicrosoft.com/{api-name}/{scope-name}`
   - Example: `https://travelinsurance.onmicrosoft.com/api/user_impersonation`
   - Where to find/create: Azure Portal > Azure AD B2C > App registrations > Your API app > Expose an API

#### Azure Function Variable

6. **VITE_AZURE_FUNCTION_URL**: The base URL for your deployed Azure Functions.
   - Example: `https://travel-insurance-api.azurewebsites.net/api`
   - Where to find: Azure Portal > Your Function App > Overview > URL
   - This is the endpoint that your frontend will use to make API calls

7. **Additional Environment Variables for Production**:
   
   When deploying to production, you need to ensure all these environment variables are correctly configured. Here's a checklist:
   
   | Environment Variable | Example Value | Description |
   |----------------------|---------------|-------------|
   | VITE_AZURE_AD_CLIENT_ID | 12345678-1234-1234-1234-1234567890ab | Your Azure AD B2C app registration client ID |
   | VITE_AZURE_AD_AUTHORITY | https://travelinsurance.b2clogin.com/travelinsurance.onmicrosoft.com/B2C_1_signupsignin | Your Azure AD B2C policy authority URL |
   | VITE_AZURE_AD_REDIRECT_URI | https://travel-insurance-app.azurestaticapps.net | Your frontend application URL |
   | VITE_AZURE_AD_KNOWN_AUTHORITY | travelinsurance.b2clogin.com | Your B2C tenant's domain |
   | VITE_AZURE_AD_SCOPE | https://travelinsurance.onmicrosoft.com/api/user_impersonation | The scope for API access |
   | VITE_AZURE_FUNCTION_URL | https://travel-insurance-api.azurewebsites.net/api | Your Azure Function app's API URL |
   | MYSQL_CONNECTION_STRING | jdbc:mysql://travel-insurance-mysql.mysql.database.azure.com:3306/insurancedb?useSSL=true&serverTimezone=UTC | Your MySQL connection string |
   | MYSQL_USER | adminuser@travel-insurance-mysql | Your MySQL admin username |
   | MYSQL_PASSWORD | YourStrongPassword123! | Your MySQL admin password |

   All these environment variables must be set correctly for the application to work properly. You set the VITE_* variables in your frontend Static Web App's configuration, and the others in your Function App's configuration.

## Step 7: Configure GitHub Actions for CI/CD

GitHub Actions is automatically configured when you create an Azure Static Web App, but you need to add secrets for environment variables:

1. In your GitHub repository, go to Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `VITE_AZURE_AD_CLIENT_ID`
   - `VITE_AZURE_AD_AUTHORITY`
   - `VITE_AZURE_AD_REDIRECT_URI`
   - `VITE_AZURE_AD_KNOWN_AUTHORITY`
   - `VITE_AZURE_AD_SCOPE`
   - `VITE_AZURE_FUNCTION_URL`

3. The GitHub workflow file is already created at `.github/workflows/azure-static-web-apps-*.yml`

## Automatic Deployments and CI/CD

When you update code in your GitHub repository, deployments may be automatically triggered depending on your setup:

### Frontend (Azure Static Web Apps)

Azure Static Web Apps has built-in CI/CD integration with GitHub. When you push changes to your repository:

1. GitHub Actions workflow is automatically triggered
2. The workflow builds and deploys your application
3. You can see the deployment status in GitHub Actions tab of your repository

You don't need to manually redeploy the frontend after code changes if:
- Your repository is connected to Azure Static Web Apps
- The GitHub Actions workflow is properly configured
- You push changes to the branch that's configured for deployment (usually `main`)

To check if automatic deployments are enabled:
1. Go to Azure Portal > Your Static Web App > Deployment > GitHub Actions
2. Ensure "GitHub Actions enabled" is set to "Yes"

### Backend (Azure Functions)

For Azure Functions, automatic deployments depend on your setup:

1. **GitHub Actions (Recommended)**:
   - If configured, changes to function code trigger automatic builds and deployments
   - Check `.github/workflows/` directory for Azure Functions deployment workflows

2. **Azure DevOps Pipelines**:
   - If you're using Azure DevOps, pipelines can be configured for automatic deployment

3. **Manual Deployment**:
   - If neither of the above is configured, you need to manually redeploy:
   ```bash
   cd src/azure-functions/travelInsuranceApi
   mvn clean package
   mvn azure-functions:deploy
   ```

### Checking Deployment Status

- **Frontend**: Go to GitHub repository > Actions tab > Look for recent workflow runs
- **Backend**: Go to Azure Portal > Your Function App > Deployment Center

### What to Do After Code Changes

1. **If CI/CD is set up properly**:
   - Push changes to your repository
   - Wait for automated deployments to complete
   - Verify functionality

2. **If no CI/CD or manual deployment needed**:
   - Frontend: Run GitHub Actions workflow manually
   - Backend: Use the manual deployment steps above

3. **After deployment, verify that**:
   - New code is deployed
   - CORS settings are applied
   - Authentication is working correctly
   - All functions are accessible

Remember that some changes to Azure resources (like CORS settings in host.json) might require manual updates through the Azure Portal or Azure CLI, even if you have CI/CD configured.

## Verifying Your Deployment

1. **Test the Frontend**
   - Visit your Azure Static Web App URL (find it in the Azure Portal > Your Static Web App > Overview)
   - You should see the travel insurance application
   - Try to browse insurance quotes without logging in (this should work)
   - Try to purchase a plan (this should prompt for login)

2. **Test Authentication**
   - Try to log in with email
   - If configured, try to log in with Google
   - Verify that you can access protected routes after login

3. **Test API Functions**
   - Browse insurance quotes to verify API connectivity
   - Try to purchase a plan after logging in

## Troubleshooting Common Issues

### CORS Issues

If you encounter CORS errors like:
```
Access to fetch at 'https://travel-insurance-api.azurewebsites.net/api/quotes' from origin 'https://lively-smoke-0eae5a610.azurestaticapps.net' has been blocked by CORS policy
```

Try these solutions:

1. **Update Azure Function CORS settings via Portal**:
   - Go to Azure Portal > Your Function App > CORS
   - Add your frontend URL (e.g., `https://lively-smoke-0eae5a610.azurestaticapps.net`)
   - Add `*` temporarily for testing
   - Save the changes

2. **Update Azure Function CORS settings via CLI**:
   ```bash
   az functionapp cors add --name travel-insurance-api --resource-group travel-insurance-rg --allowed-origins "*"
   ```

3. **Verify host.json CORS configuration**:
   - Download your function app's host.json
   - Ensure it includes the correct CORS configuration
   - Upload the updated host.json

4. **Update Function Code to Include CORS Headers**:
   - Make sure every HTTP response includes the necessary CORS headers
   - Handle OPTIONS requests correctly

5. **Restart the Function App**:
   ```bash
   az functionapp restart --name travel-insurance-api --resource-group travel-insurance-rg
   ```

6. **Check Network Requests in Browser**:
   - Open the browser developer tools (F12) and go to the Network tab
   - Look for the failing requests and check the response headers
   - Verify that CORS headers are present in the response

7. **Ensure Function is Handling OPTIONS Requests**:
   - Your function should include `OPTIONS` in the supported HTTP methods
   - It should return a 200 OK response with CORS headers for OPTIONS requests

### Azure AD B2C Issues

1. **Redirect URI Errors**:
   - Check that the redirect URI in your app registration matches the one in your frontend config
   - Example: If your app is deployed at `https://lively-smoke-0eae5a610.azurestaticapps.net`, your redirect URI should be set to this

2. **CORS Errors**:
   - If you see CORS errors in the browser console:
   ```bash
   az functionapp cors add --name travel-insurance-api --resource-group travel-insurance-rg --allowed-origins "https://your-frontend-url"
   ```

3. **Authentication Failures**:
   - Check the browser console for detailed error messages
   - Verify all B2C environment variables are correct
   - Ensure your user flow is published and active

### Database Connection Issues

If your Azure Functions can't connect to the database:

1. Check MySQL firewall rules:
   ```bash
   az mysql server firewall-rule list --resource-group travel-insurance-rg --server-name travel-insurance-mysql
   ```

2. Verify connection string format:
   ```
   jdbc:mysql://travel-insurance-mysql.mysql.database.azure.com:3306/insurancedb?useSSL=true&serverTimezone=UTC
   ```

3. Check MySQL credentials in Function App settings

### Function App Errors

1. Check Function App logs:
   - Go to Azure Portal > Your Function App > Functions
   - Click on a function
   - Go to the "Monitor" tab
   - Check recent invocations and logs

2. Verify environment variables:
   - Go to Azure Portal > Your Function App > Configuration
   - Check that all application settings are correctly set

## Cost Management

To avoid unexpected costs:

1. Use consumption plan for Functions during development
2. Consider the Free tier for Azure Static Web Apps
3. For MySQL, start with Basic tier and scale up as needed
4. Set up budget alerts in the Azure Portal

## Security Recommendations

1. Store all credentials as environment variables, never in code
2. Use managed identities where possible
3. Configure SSL/TLS for all services
4. Set up Azure Security Center for monitoring
5. Regularly rotate database passwords and API keys

## Troubleshooting Authentication Errors

### "No active account! Sign in before calling API" Error

1. **Check Function Authorization Level**:
   - Go to Azure Portal > Your Function App > Functions > Your Function > Integration
   - Ensure the `authLevel` is set to `ANONYMOUS` in the Java code.
   - The function.json file should have `"authLevel" : "ANONYMOUS"`.

2. **Check API Call Configuration**:
   - Ensure your frontend API call specifies `requiresAuth: false` when calling `callAzureFunction`.

3. **Verify App Registration**:
   - Ensure your app registration in Azure AD B2C is properly configured.

4. **Check Browser Console**:
   - Review the browser console for detailed error messages.

### Unable to Get Authentication Token

1. **Check Environment Variables**:
   - Ensure all Azure AD B2C environment variables are correctly set.

2. **Verify App Registration**:
   - Ensure your app registration in Azure AD B2C is properly configured.

3. **Check Browser Console**:
   - Review the browser console for detailed error messages.
