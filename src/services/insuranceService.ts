import { supabase } from '@/integrations/supabase/client';
import { 
  TravelDetails, 
  InsurancePlan, 
  InsuranceBenefit, 
  DbInsurancePlan, 
  DbInsuranceBenefit,
  PaymentMethod
} from '@/types';

// Supabase API endpoint URLs
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rbsmlwqhmmjwlwyeefmn.supabase.co';

/**
 * Get insurance quotes based on travel details
 */
export const getInsuranceQuotes = async (travelDetails: TravelDetails): Promise<InsurancePlan[]> => {
  try {
    console.log('Fetching insurance quotes for:', JSON.stringify(travelDetails, null, 2));
    
    // Call Supabase Edge Function using the functions.invoke method
    const { data, error } = await supabase.functions.invoke('get-insurance-quotes', {
      body: { travelDetails },
    });

    if (error) {
      console.error('Error invoking get-insurance-quotes function:', error);
      throw new Error(error.message || 'Failed to fetch insurance quotes');
    }

    console.log('Received quotes data:', JSON.stringify(data, null, 2));
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No quotes data returned from function');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching insurance quotes:', error);
    throw error;
  }
};

/**
 * Get details of a specific insurance plan
 */
export const getPlanDetails = async (planId: string): Promise<InsurancePlan | null> => {
  try {
    // Fetch plan details
    const { data: planData, error: planError } = await supabase
      .from('insurance_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) throw planError;
    if (!planData) return null;

    // Fetch benefits for this plan
    const { data: benefitsData, error: benefitsError } = await supabase
      .from('insurance_benefits')
      .select('*')
      .eq('plan_id', planId);

    if (benefitsError) throw benefitsError;

    const benefits: InsuranceBenefit[] = (benefitsData || []).map(benefit => ({
      name: benefit.name,
      description: benefit.description,
      limit: benefit.limit,
      isHighlighted: benefit.is_highlighted,
    }));

    return {
      id: planData.id,
      name: planData.name,
      provider: planData.provider,
      price: planData.base_price, // This is the base price, final would be calculated
      benefits,
      coverageLimit: planData.coverage_limit,
      rating: planData.rating,
      terms: planData.terms,
      exclusions: planData.exclusions || [],
      badge: planData.badge as ('Popular' | 'Best Value' | 'Premium' | undefined),
      pros: planData.pros || [],
      cons: planData.cons || [],
      logoUrl: planData.logo_url,
    };
  } catch (error) {
    console.error('Error fetching plan details:', error);
    return null;
  }
};

/**
 * Process payment
 */
export const processPayment = async (
  paymentDetails: {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardHolderName?: string;
  }
): Promise<{ success: boolean; reference?: string; error?: string }> => {
  try {
    console.log('Processing payment:', paymentDetails);
    
    // Call Supabase Edge Function using the functions.invoke method
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: paymentDetails,
    });

    if (error) {
      console.error('Error invoking process-payment function:', error);
      return { 
        success: false, 
        error: error.message || 'Payment processing failed' 
      };
    }
    
    return data || { success: false, error: 'No response from payment service' };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Purchase an insurance plan
 */
export const purchaseInsurancePlan = async (
  planId: string,
  travelDetails: TravelDetails,
  price: number,
  paymentMethod: PaymentMethod,
  paymentReference?: string
): Promise<{ success: boolean; policyId?: string; referenceNumber?: string; error?: string }> => {
  try {
    console.log('Purchasing plan:', { planId, travelDetails, price, paymentMethod });
    
    // Call Supabase Edge Function using the functions.invoke method
    const { data, error } = await supabase.functions.invoke('purchase-plan', {
      body: {
        planId,
        travelDetails,
        price,
        paymentMethod,
        paymentReference
      },
    });

    if (error) {
      console.error('Error invoking purchase-plan function:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to purchase insurance plan' 
      };
    }
    
    return data || { success: false, error: 'No response from purchase service' };
  } catch (error) {
    console.error('Error purchasing insurance plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  profileData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone?: string; 
    address?: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if profile exists
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', data.user.id);

      if (updateError) throw updateError;
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
        });

      if (insertError) throw insertError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Get user's purchased policies
 */
export const getUserPolicies = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error('User not authenticated');
    }
    
    const { data: policies, error: policiesError } = await supabase
      .from('travel_policies')
      .select(`
        *,
        insurance_plans(name, provider),
        traveler_info(*)
      `)
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false });

    if (policiesError) throw policiesError;
    
    return policies || [];
  } catch (error) {
    console.error('Error fetching user policies:', error);
    return [];
  }
};

/**
 * Upload document and get URL
 */
export const uploadDocument = async (
  policyId: string,
  travelerId: string,
  file: File,
  documentType: 'passport' | 'visa'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${policyId}/${travelerId}/${documentType}_${Date.now()}.${fileExtension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('travel_documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('travel_documents')
      .getPublicUrl(data.path);
    
    // Update the traveler record with the document URL
    const updateField = documentType === 'passport' ? 'passport_document_url' : 'visa_document_url';
    
    const { error: updateError } = await supabase
      .from('traveler_info')
      .update({ [updateField]: publicUrl })
      .eq('id', travelerId);
    
    if (updateError) throw updateError;
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error(`Error uploading ${documentType} document:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};
