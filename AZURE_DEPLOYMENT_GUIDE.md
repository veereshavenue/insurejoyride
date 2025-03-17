
# Azure Deployment Guide for Travel Insurance Application

This document provides comprehensive instructions for deploying the entire Travel Insurance application (front-end, back-end, and database) on Azure Cloud.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed
- GitHub account for source code repository
- Node.js and npm installed for front-end development
- Maven installed for Java backend development

## Infrastructure Components

1. **Front-end**: Azure Static Web Apps
2. **Back-end APIs**: Azure Functions (Java)
3. **Database**: Azure MySQL
4. **Authentication**: Azure AD B2C

## Step 1: Set Up Azure MySQL Database

1. Create an Azure MySQL database:

```bash
az mysql server create --resource-group travel-insurance-rg --name travel-insurance-mysql --location eastus --admin-user adminuser --admin-password <your-password> --sku-name GP_Gen5_2
```

2. Configure firewall rules to allow Azure services:

```bash
az mysql server firewall-rule create --resource-group travel-insurance-rg --server travel-insurance-mysql --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

3. Create the database schema:

```bash
mysql -h travel-insurance-mysql.mysql.database.azure.com -u adminuser@travel-insurance-mysql -p
```

4. Execute the schema creation script from `src/db/mysql_migration.sql`

## Step 2: Set Up Azure AD B2C for Authentication

1. Create an Azure AD B2C tenant:
   - Go to Azure Portal > Azure AD B2C
   - Create a new tenant or use an existing one

2. Register your application:
   - Navigate to App registrations
   - Click "New registration"
   - Enter a name for your application
   - For Redirect URI, enter your frontend URL (e.g., https://your-static-web-app.azurestaticapps.net)
   - Click "Register"

3. Configure user flows:
   - Navigate to User flows
   - Create sign-up and sign-in flow
   - Create password reset flow
   - Customize the user attributes as needed

4. Configure identity providers:
   - Go to Identity providers
   - Enable Email/Password authentication
   - To enable Google auth, select "Google" and enter your Google OAuth credentials

5. Note your B2C tenant details:
   - Tenant name
   - Application (client) ID
   - User flow names
   - These will be used in your application configuration

## Step 3: Deploy Azure Functions (Java Backend)

1. Navigate to the Azure Functions project:

```bash
cd src/azure-functions/travelInsuranceApi
```

2. Build the project:

```bash
mvn clean package
```

3. Deploy to Azure:

```bash
mvn azure-functions:deploy
```

4. Configure environment variables in Azure Portal:
   - Go to your Function App > Configuration
   - Add these application settings:
     - `MYSQL_CONNECTION_STRING`: jdbc:mysql://travel-insurance-mysql.mysql.database.azure.com:3306/insurancedb?useSSL=true
     - `MYSQL_USER`: adminuser@travel-insurance-mysql
     - `MYSQL_PASSWORD`: <your-password>
     - `AZURE_AD_B2C_TENANT`: Your Azure AD B2C tenant name
     - `AZURE_AD_B2C_CLIENT_ID`: Your application client ID
     - `AZURE_AD_B2C_CLIENT_SECRET`: Your application client secret

## Step 4: Configure CORS for Azure Functions

1. Add CORS configuration to allow requests from your frontend:
   - Go to your Function App > CORS
   - Add your frontend URL (e.g., https://your-static-web-app.azurestaticapps.net)
   - Check "Enable Access-Control-Allow-Credentials"
   - Click "Save"

## Step 5: Deploy Front-end to Azure Static Web Apps

1. Create a GitHub repository and push your code

2. Create an Azure Static Web App:

```bash
az staticwebapp create --name travel-insurance-app --resource-group travel-insurance-rg --source https://github.com/yourusername/your-repo --branch main --app-location "/" --output-location "dist" --login-with-github
```

3. Configure environment variables in Azure Portal:
   - Go to your Static Web App > Configuration
   - Add these application settings:
     - `VITE_AZURE_AD_CLIENT_ID`: Your Azure AD B2C application client ID
     - `VITE_AZURE_AD_AUTHORITY`: Your Azure AD B2C authority URL
     - `VITE_AZURE_AD_REDIRECT_URI`: Your frontend URL
     - `VITE_AZURE_AD_KNOWN_AUTHORITY`: Your Azure AD B2C tenant name
     - `VITE_AZURE_AD_SCOPE`: API scope for your application
     - `VITE_AZURE_FUNCTION_URL`: URL of your Azure Functions

## Step 6: Configure GitHub Actions for CI/CD

1. Create a GitHub workflow file at `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web App CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v2
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          app_location: "/"
          api_location: ""
          output_location: "dist"
          app_build_command: "npm run build"
        env:
          VITE_AZURE_AD_CLIENT_ID: ${{ secrets.VITE_AZURE_AD_CLIENT_ID }}
          VITE_AZURE_AD_AUTHORITY: ${{ secrets.VITE_AZURE_AD_AUTHORITY }}
          VITE_AZURE_AD_REDIRECT_URI: ${{ secrets.VITE_AZURE_AD_REDIRECT_URI }}
          VITE_AZURE_AD_KNOWN_AUTHORITY: ${{ secrets.VITE_AZURE_AD_KNOWN_AUTHORITY }}
          VITE_AZURE_AD_SCOPE: ${{ secrets.VITE_AZURE_AD_SCOPE }}
          VITE_AZURE_FUNCTION_URL: ${{ secrets.VITE_AZURE_FUNCTION_URL }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

2. Add the necessary secrets to your GitHub repository:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: From Azure Static Web App deployment
   - `VITE_AZURE_AD_CLIENT_ID`: Your Azure AD B2C application client ID
   - `VITE_AZURE_AD_AUTHORITY`: Your Azure AD B2C authority URL
   - `VITE_AZURE_AD_REDIRECT_URI`: Your frontend URL
   - `VITE_AZURE_AD_KNOWN_AUTHORITY`: Your Azure AD B2C tenant name
   - `VITE_AZURE_AD_SCOPE`: API scope for your application
   - `VITE_AZURE_FUNCTION_URL`: URL of your Azure Functions

## Step 7: CI/CD for Azure Functions

1. Create a GitHub workflow file at `.github/workflows/azure-functions.yml`:

```yaml
name: Deploy Java Azure Functions

on:
  push:
    branches:
      - main
    paths:
      - 'src/azure-functions/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Set up Java
      uses: actions/setup-java@v1
      with:
        java-version: '11'

    - name: Build with Maven
      run: |
        cd src/azure-functions/travelInsuranceApi
        mvn clean package

    - name: Deploy to Azure Functions
      uses: Azure/functions-action@v1
      with:
        app-name: travel-insurance-api
        package: src/azure-functions/travelInsuranceApi/target/azure-functions/travel-insurance-api
        publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

2. Add the necessary secret to your GitHub repository:
   - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: From Azure Function App > Get publish profile

## Step 8: Update Java Backend Functions Implementation

The Java backend implementation provides the following endpoints:

1. **GET /api/quotes**: Get insurance quotes based on travel details
2. **GET /api/plans/{id}**: Get plan details by ID
3. **POST /api/payment/process**: Process payment for a plan
4. **POST /api/purchase**: Purchase a plan
5. **POST /api/documents/upload**: Upload travel documents
6. **GET /api/user/profile**: Get user profile
7. **POST /api/user/profile**: Update user profile

Each function is implemented in a separate Java class in the `src/azure-functions/travelInsuranceApi/src/main/java/com/travelinsurance/` directory.

## Step 9: Configure Azure AD B2C Token Validation in Azure Functions

In your Java code, add a token validation filter to ensure the Azure AD B2C tokens are validated:

```java
// Example token validation in a function
@FunctionName("secureFunction")
public HttpResponseMessage run(
        @HttpTrigger(name = "req", 
                    methods = {HttpMethod.GET}, 
                    authLevel = AuthorizationLevel.ANONYMOUS) 
                    HttpRequestMessage<Optional<String>> request,
        final ExecutionContext context) {
    
    // Get the Authorization header
    String authHeader = request.getHeaders().get("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return request.createResponseBuilder(HttpStatus.UNAUTHORIZED)
                .body("Authorization header is required")
                .build();
    }
    
    String token = authHeader.substring("Bearer ".length());
    
    // Validate the token using MSAL or JWT library
    if (!validateToken(token)) {
        return request.createResponseBuilder(HttpStatus.UNAUTHORIZED)
                .body("Invalid token")
                .build();
    }
    
    // Process the request
    // ...
}
```

## Testing and Monitoring

1. **Test the Deployment**:
   - Visit your Static Web App URL
   - Test the API endpoints
   - Test the authentication flow
   - Verify database connections

2. **Set Up Monitoring**:
   - Enable Application Insights for both Static Web App and Functions
   - Set up alerts for performance and availability

3. **Logs and Diagnostics**:
   - Functions logs: Azure Portal > Your Function App > Functions > Monitor
   - Static Web App logs: Azure Portal > Your Static Web App > Monitoring > Logs
   - AD B2C logs: Azure Portal > Azure AD B2C > Audit logs

## Troubleshooting

1. **Authentication Issues**:
   - Verify Azure AD B2C configuration
   - Check redirect URIs
   - Review authentication logs in Azure AD B2C

2. **API Connection Issues**:
   - Verify CORS settings
   - Check network requests in browser dev tools
   - Ensure environment variables are set correctly

3. **Database Connection Issues**:
   - Verify firewall rules
   - Check connection strings
   - Test connectivity from Functions to MySQL

## Cost Optimization

1. Use consumption plan for Functions during development
2. Scale to Premium plan only when needed for production
3. Consider reserved instances for MySQL for cost savings
4. Monitor usage regularly and adjust resources
