
# Supabase Setup Guide for Travel Insurance Application

This guide provides detailed instructions for setting up your Supabase project for the travel insurance application.

## Prerequisites

Before proceeding, ensure you have:

1. Created a Supabase account at [supabase.com](https://supabase.com)
2. Created a new project named "manibansal@hotmail.com" under the organization "InsureNext"
3. Taken note of your Supabase project URL and anon key

## Database Setup

### Step 1: Run the Migration Script

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `src/db/migration.sql` 
3. Paste the SQL script into the SQL Editor
4. Click "Run" to execute the script

This will create all necessary tables with proper relationships, constraints, and row-level security policies.

### Step 2: Verify Table Creation

After running the migration script, verify that the following tables have been created:

- `insurance_plans`
- `insurance_benefits`
- `user_profiles`
- `travel_policies`
- `traveler_info`
- `payment_transactions`

Also verify that the `travel_documents` storage bucket has been created.

## Storage Setup

### Step 1: Configure Storage Bucket

1. Go to the Storage section in your Supabase dashboard
2. Verify that the "travel_documents" bucket exists
3. Configure CORS for the bucket:
   - Go to the bucket settings
   - Add a new CORS configuration:
     - Allow Origin: `*` (for development) or your production domain
     - Allow Methods: `GET, POST, PUT, DELETE, OPTIONS`
     - Allow Headers: `*`

### Step 2: Set Storage Policies

For proper access control, ensure the following policies are in place for the "travel_documents" bucket:

1. Navigate to the "Policies" tab for the "travel_documents" bucket
2. Create a policy that allows authenticated users to upload files:
   - Name: "Users can upload their own documents"
   - Allowed operations: `INSERT`
   - Policy definition: `auth.uid() = (SELECT user_id FROM travel_policies WHERE id = storage.foldername::uuid)`

3. Create a policy that allows users to read their own documents:
   - Name: "Users can view their own documents"
   - Allowed operations: `SELECT`
   - Policy definition: `auth.uid() = (SELECT user_id FROM travel_policies WHERE id = storage.foldername::uuid)`

## Authentication Setup

### Step 1: Configure Email Authentication

1. Go to the Authentication section in your Supabase dashboard
2. Navigate to Providers and ensure Email is enabled
3. Configure your site URL and redirect URLs in the URL Configuration section
4. Optionally, customize the email templates for confirmation, magic link, and password recovery

### Step 2: Set Up Email Confirmations

1. Go to Authentication > Settings
2. Enable "Confirm email" if you want users to verify their email addresses

## Environment Variables

After setting up your Supabase project, you need to add the following environment variables to your application:

1. Create a `.env.local` file in the project root with:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

Replace the values with your actual Supabase project URL and anon key.

## Testing the Setup

To verify your Supabase setup:

1. Try to register a new user through your application
2. Create a test insurance policy
3. Upload a test document
4. Query the created records via the Supabase dashboard to ensure data is being stored correctly

## Next Steps

After completing the Supabase setup:

1. Deploy your application frontend to a hosting service
2. Set up proper production environment variables
3. Configure your application's domain in Supabase authentication settings

For more detailed information on Supabase features and configurations, refer to the [Supabase documentation](https://supabase.com/docs).
