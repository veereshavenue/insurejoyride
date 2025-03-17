
import { createClient } from '@supabase/supabase-js';

// Default values for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbsmlwqhmmjwlwyeefmn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJic21sd3FobW1qd2x3eWVlZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxOTgzOTEsImV4cCI6MjA1Nzc3NDM5MX0.bI1IxvPEeKXt-3X13tnrNwl3s6H0K7JRTn3knwgtc40';

// Log a warning if environment variables are not properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Using default development values.');
}

// Create a Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  return await supabaseClient.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return await supabaseClient.auth.signUp({ email, password });
};

export const signOut = async () => {
  return await supabaseClient.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabaseClient.auth.getUser();
};

export const getSession = async () => {
  return await supabaseClient.auth.getSession();
};
