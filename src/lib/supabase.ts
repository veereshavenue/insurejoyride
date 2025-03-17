
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching current user:', error.message);
    return null;
  }
  return user;
};

// Helper to get the current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching current session:', error.message);
    return null;
  }
  return session;
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return !!session;
};

// Helper to sign up a new user
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to sign in a user
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

// Helper to create a user profile
export const createUserProfile = async (profile: Database['public']['Tables']['user_profiles']['Insert']) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to get a user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to update a user profile
export const updateUserProfile = async (userId: string, updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to fetch insurance plans
export const getInsurancePlans = async () => {
  const { data, error } = await supabase
    .from('insurance_plans')
    .select(`
      *,
      insurance_benefits(*)
    `)
    .eq('is_active', true);
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to fetch a specific insurance plan
export const getInsurancePlan = async (planId: string) => {
  const { data, error } = await supabase
    .from('insurance_plans')
    .select(`
      *,
      insurance_benefits(*)
    `)
    .eq('id', planId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to create a new travel policy
export const createTravelPolicy = async (policy: Database['public']['Tables']['travel_policies']['Insert']) => {
  const { data, error } = await supabase
    .from('travel_policies')
    .insert(policy)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to get travel policies for a user
export const getUserPolicies = async (userId: string) => {
  const { data, error } = await supabase
    .from('travel_policies')
    .select(`
      *,
      insurance_plans(*),
      traveler_info(*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to create traveler information
export const createTravelerInfo = async (travelerInfo: Database['public']['Tables']['traveler_info']['Insert']) => {
  const { data, error } = await supabase
    .from('traveler_info')
    .insert(travelerInfo)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to upload documents to Supabase storage
export const uploadDocument = async (bucketName: string, filePath: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Helper to get a public URL for a file
export const getPublicUrl = (bucketName: string, filePath: string) => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Helper to create a payment transaction
export const createPaymentTransaction = async (transaction: Database['public']['Tables']['payment_transactions']['Insert']) => {
  const { data, error } = await supabase
    .from('payment_transactions')
    .insert(transaction)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};
