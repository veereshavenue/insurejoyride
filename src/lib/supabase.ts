
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

// Export the client for backward compatibility
export const supabaseClient = supabaseClient;
export const supabase = supabaseClient; // Export as alias for backward compatibility

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

// User profile functions
export const createUserProfile = async (userProfileData: any) => {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .insert(userProfileData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Insurance plan functions
export const getInsurancePlans = async () => {
  const { data: plans, error: plansError } = await supabaseClient
    .from('insurance_plans')
    .select('*, insurance_benefits(*)');
  
  if (plansError) throw plansError;
  return plans;
};

export const getInsurancePlan = async (planId: string) => {
  const { data: plan, error: planError } = await supabaseClient
    .from('insurance_plans')
    .select('*, insurance_benefits(*)')
    .eq('id', planId)
    .single();
  
  if (planError) throw planError;
  return plan;
};

// Travel policy functions
export const createTravelPolicy = async (policyData: any) => {
  const { data, error } = await supabaseClient
    .from('travel_policies')
    .insert(policyData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserPolicies = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from('travel_policies')
    .select(`
      *,
      insurance_plans(name, provider),
      traveler_info(*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

// Traveler info functions
export const createTravelerInfo = async (travelerData: any) => {
  const { data, error } = await supabaseClient
    .from('traveler_info')
    .insert(travelerData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Payment transaction functions
export const createPaymentTransaction = async (transactionData: any) => {
  const { data, error } = await supabaseClient
    .from('payment_transactions')
    .insert(transactionData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
