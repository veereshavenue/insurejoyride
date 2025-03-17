
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Set default environment variables for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbsmlwqhmmjwlwyeefmn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJic21sd3FobW1qd2x3eWVlZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxOTgzOTEsImV4cCI6MjA1Nzc3NDM5MX0.bI1IxvPEeKXt-3X13tnrNwl3s6H0K7JRTn3knwgtc40';

// Create a single Supabase client instance for the entire application
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Log important information for debugging
console.log('Supabase client initialized with URL:', supabaseUrl);
