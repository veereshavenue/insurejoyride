
# Azure Deployment Guide for Travel Insurance Application

This document provides comprehensive instructions for deploying the entire Travel Insurance application (front-end, back-end, and database) on Azure Cloud.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed
- GitHub account for source code repository
- Node.js and npm installed for front-end development
- Maven installed for Java backend development
- Supabase account (for database)

## Infrastructure Components

1. **Front-end**: Azure Static Web Apps
2. **Back-end APIs**: Azure Functions (Java)
3. **Database**: Supabase (PostgreSQL) and Azure MySQL for Azure Functions

## Step 1: Set Up Supabase

1. Create a new Supabase project
2. Execute the migration scripts in `src/db/migration.sql`
3. Note your Supabase URL and anon key
4. Create and configure the storage bucket for travel documents:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('travel_documents', 'travel_documents', true);
   
   -- Set up RLS policies for the travel_documents bucket
   -- Allow authenticated users to upload their own travel documents
   CREATE POLICY "Users can upload their own travel documents"
   ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (
     bucket_id = 'travel_documents' AND
     (storage.foldername(name))[1] IN (
       SELECT id::text FROM public.travel_policies WHERE user_id = auth.uid()
     )
   );
   
   -- Allow authenticated users to view their own travel documents
   CREATE POLICY "Users can view their own travel documents"
   ON storage.objects
   FOR SELECT TO authenticated
   USING (
     bucket_id = 'travel_documents' AND
     (storage.foldername(name))[1] IN (
       SELECT id::text FROM public.travel_policies WHERE user_id = auth.uid()
     )
   );
   ```

5. Deploy the Edge Functions:
   ```bash
   supabase functions deploy get-insurance-quotes
   supabase functions deploy process-payment
   supabase functions deploy purchase-plan
   ```

## Step 2: Set Up Azure MySQL Database

1. Create an Azure MySQL database:

```bash
az mysql server create --resource-group travel-insurance-rg --name travel-insurance-mysql --location eastus --admin-user adminuser --admin-password <your-password> --sku-name GP_Gen5_2
```

2. Configure firewall rules to allow Azure services:

```bash
az mysql server firewall-rule create --resource-group travel-insurance-rg --server travel-insurance-mysql --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

3. Create the database and execute the schema:

```bash
mysql -h travel-insurance-mysql.mysql.database.azure.com -u adminuser@travel-insurance-mysql -p
```

4. Import the SQL schema from `src/db/migration.sql`

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
     - `SUPABASE_URL`: Your Supabase URL
     - `SUPABASE_ANON_KEY`: Your Supabase anon key

## Step 4: Deploy Front-end to Azure Static Web Apps

1. Create a GitHub repository and push your code

2. Create an Azure Static Web App:

```bash
az staticwebapp create --name travel-insurance-app --resource-group travel-insurance-rg --source https://github.com/yourusername/your-repo --branch main --app-location "/" --output-location "dist" --login-with-github
```

3. Configure environment variables in Azure Portal:
   - Go to your Static Web App > Configuration
   - Add these application settings:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `VITE_API_URL`: URL of your Azure Functions

## Step 5: Configure GitHub Actions for CI/CD

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
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

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
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_API_URL`: URL of your Azure Functions

## Step 6: CI/CD for Azure Functions

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

## Step 7: Java Backend Functions Implementation

The Java backend implementation provides the following endpoints:

1. **GET /api/quotes**: Get insurance quotes based on travel details
2. **GET /api/plans/{id}**: Get plan details by ID
3. **POST /api/payment**: Process payment for a plan
4. **POST /api/purchase**: Purchase a plan
5. **POST /api/documents/upload**: Upload travel documents
6. **GET /api/user/profile**: Get user profile
7. **POST /api/user/profile**: Update user profile

Each function is implemented in a separate Java class in the `src/azure-functions/travelInsuranceApi/src/main/java/com/travelinsurance/` directory.

## Testing and Monitoring

1. **Test the Deployment**:
   - Visit your Static Web App URL
   - Test the API endpoints
   - Verify database connections

2. **Set Up Monitoring**:
   - Enable Application Insights for both Static Web App and Functions
   - Set up alerts for performance and availability

3. **Logs and Diagnostics**:
   - Functions logs: Azure Portal > Your Function App > Functions > Monitor
   - Static Web App logs: Azure Portal > Your Static Web App > Monitoring > Logs

## Troubleshooting

1. **CORS Issues**:
   - Add your frontend URL to the CORS settings of your Function App

2. **Database Connection Issues**:
   - Verify firewall rules
   - Check connection strings
   - Test connectivity from Functions to MySQL

3. **Authentication Issues**:
   - Verify Supabase settings
   - Check JWT tokens in requests

## Production Considerations

1. **Scaling**:
   - Configure auto-scaling for Functions
   - Monitor performance and adjust resources as needed

2. **Backup**:
   - Set up regular backups for MySQL database
   - Consider geo-redundancy for critical data

3. **Security**:
   - Enable HTTPS
   - Use managed identities for Azure resources
   - Implement proper authentication and authorization

## Cost Optimization

1. Use consumption plan for Functions during development
2. Scale to Premium plan only when needed for production
3. Consider reserved instances for MySQL for cost savings
4. Monitor usage regularly and adjust resources
