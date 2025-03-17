
# Supabase Setup Guide for Travel Insurance Application

This guide provides detailed instructions for setting up your Supabase project for the travel insurance application.

## Prerequisites

Before proceeding, ensure you have:

1. Created a Supabase account at [supabase.com](https://supabase.com)
2. Created a new project named "manibansal@hotmail.com" under the organization "InsureNext"
3. Taken note of your Supabase project URL and anon key

## Step 1: Database Setup

### Run the Migration Script

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `src/db/migration.sql` 
3. Paste the SQL script into the SQL Editor
4. Click "Run" to execute the script

This will create all necessary tables with proper relationships, constraints, and row-level security policies.

### Verify Table Creation

After running the migration script, verify that the following tables have been created:

- `insurance_plans`
- `insurance_benefits`
- `user_profiles`
- `travel_policies`
- `traveler_info`
- `payment_transactions`

## Step 2: Storage Setup

### Configure Storage Bucket

1. Go to the Storage section in your Supabase dashboard
2. Verify that the "travel_documents" bucket has been created by the migration script
3. Configure CORS for the bucket:
   - Go to the bucket settings
   - Add a new CORS configuration:
     - Allow Origin: `*` (for development) or your production domain
     - Allow Methods: `GET, POST, PUT, DELETE, OPTIONS`
     - Allow Headers: `*`

### Set Storage Policies

Verify the following storage policies are in place for the "travel_documents" bucket:

1. Navigate to the "Policies" tab for the "travel_documents" bucket
2. Create a policy that allows authenticated users to upload files:
   ```sql
   CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT TO authenticated USING (
     auth.uid() = (
       SELECT user_id FROM public.travel_policies 
       WHERE id::text = storage.foldername(name)[1]
     )
   );
   ```

3. Create a policy that allows users to read their own documents:
   ```sql
   CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT TO authenticated USING (
     auth.uid() = (
       SELECT user_id FROM public.travel_policies 
       WHERE id::text = storage.foldername(name)[1]
     )
   );
   ```

## Step 3: Edge Functions Setup

### Deploy Edge Functions

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your-project-id
   ```

4. Deploy all edge functions:
   ```
   supabase functions deploy get-insurance-quotes
   supabase functions deploy process-payment
   supabase functions deploy purchase-plan
   ```

### Test Edge Functions

After deploying the edge functions, you can test them using the Supabase dashboard:

1. Go to the Edge Functions section in your Supabase dashboard
2. Select the function you want to test
3. Use the "Test" tab to send a request with sample data
4. Verify the function returns the expected response

## Step 4: Environment Variables

1. Update the `.env.local` file in your project with your Supabase project URL and anon key:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. For the Edge Functions, set the following secrets:
   ```
   supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=your-service-role-key
   ```

## Step 5: Authentication Setup

### Configure Email Authentication

1. Go to the Authentication section in your Supabase dashboard
2. Navigate to Providers and ensure Email is enabled
3. Configure your site URL and redirect URLs in the URL Configuration section
4. Optionally, customize the email templates for confirmation, magic link, and password recovery

### Set Up Email Confirmations

1. Go to Authentication > Settings
2. Enable "Confirm email" if you want users to verify their email addresses

## Step 6: Verify the Setup

To verify your Supabase setup:

1. Try to register a new user through your application
2. Create a test insurance policy
3. Upload a test document
4. Query the created records via the Supabase dashboard to ensure data is being stored correctly

## Next Steps

After completing the Supabase setup:

1. Deploy your application frontend to a hosting service
2. Set up proper production environment variables
3. Monitor your Edge Functions and database performance in the Supabase dashboard

For more detailed information on Supabase features and configurations, refer to the [Supabase documentation](https://supabase.com/docs).
