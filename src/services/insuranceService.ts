
import { supabase } from '@/lib/supabase';
import { 
  TravelDetails, 
  InsurancePlan, 
  InsuranceBenefit, 
  DbInsurancePlan, 
  DbInsuranceBenefit,
  DbTravelPolicy,
  DbTravelerInfo,
  DbPaymentTransaction,
  PaymentMethod,
  PaymentStatus
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get insurance quotes based on travel details
 */
export const getInsuranceQuotes = async (travelDetails: TravelDetails): Promise<InsurancePlan[]> => {
  try {
    // Fetch active insurance plans
    const { data: plansData, error: plansError } = await supabase
      .from('insurance_plans')
      .select('*')
      .eq('is_active', true);

    if (plansError) throw plansError;
    if (!plansData) return [];

    // Calculate the number of days
    const startDate = new Date(travelDetails.startDate);
    const endDate = new Date(travelDetails.endDate);
    const tripDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    // Fetch benefits for all plans
    const { data: benefitsData, error: benefitsError } = await supabase
      .from('insurance_benefits')
      .select('*');

    if (benefitsError) throw benefitsError;
    if (!benefitsData) return [];

    // Group benefits by plan_id
    const benefitsByPlanId = benefitsData.reduce((acc, benefit) => {
      if (!acc[benefit.plan_id]) {
        acc[benefit.plan_id] = [];
      }
      acc[benefit.plan_id].push({
        name: benefit.name,
        description: benefit.description,
        limit: benefit.limit,
        isHighlighted: benefit.is_highlighted,
      });
      return acc;
    }, {} as Record<string, InsuranceBenefit[]>);

    // Calculate final price based on travel details
    return plansData.map((plan: DbInsurancePlan) => {
      // Base multipliers
      let priceMultiplier = 1;
      
      // Adjust for coverage type
      if (travelDetails.coverageType === 'Worldwide') {
        priceMultiplier *= 1.5;
      } else if (travelDetails.coverageType === 'Schengen') {
        priceMultiplier *= 1.2;
      }
      
      // Adjust for trip type
      if (travelDetails.tripType === 'Annual Multi-Trips') {
        priceMultiplier *= 4; // Annual plans cost more
      } else {
        // Adjust for trip duration for single trips
        priceMultiplier *= Math.min(tripDays / 7, 10); // Cap at 10x for very long trips
      }
      
      // Adjust for cover type and number of travelers
      const numTravelers = travelDetails.travelers.length;
      if (travelDetails.coverType === 'Family') {
        priceMultiplier *= Math.min(1.8, 1 + (numTravelers * 0.2)); // Family discount
      } else if (travelDetails.coverType === 'Group') {
        priceMultiplier *= Math.min(2.5, 1 + (numTravelers * 0.25)); // Group rate
      } else {
        priceMultiplier *= numTravelers; // Individual: direct multiplication
      }
      
      const calculatedPrice = Math.round(plan.base_price * priceMultiplier);
      
      return {
        id: plan.id,
        name: plan.name,
        provider: plan.provider,
        price: calculatedPrice,
        benefits: benefitsByPlanId[plan.id] || [],
        coverageLimit: plan.coverage_limit,
        rating: plan.rating,
        terms: plan.terms,
        exclusions: plan.exclusions || [],
        badge: plan.badge as ('Popular' | 'Best Value' | 'Premium' | undefined),
        pros: plan.pros || [],
        cons: plan.cons || [],
        logoUrl: plan.logo_url,
      };
    });
  } catch (error) {
    console.error('Error fetching insurance quotes:', error);
    return [];
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
 * Purchase an insurance plan
 */
export const purchaseInsurancePlan = async (
  userId: string,
  planId: string,
  travelDetails: TravelDetails,
  price: number,
  paymentMethod: PaymentMethod,
  paymentReference?: string
): Promise<{ success: boolean; policyId?: string; error?: string }> => {
  // Start a Supabase transaction
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // Generate a unique reference number for the policy
    const referenceNumber = `POL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // 1. Create the travel policy record
    const { data: policyData, error: policyError } = await supabase
      .from('travel_policies')
      .insert({
        user_id: userId,
        plan_id: planId,
        reference_number: referenceNumber,
        coverage_type: travelDetails.coverageType,
        origin_country: travelDetails.originCountry,
        destination_country: travelDetails.destinationCountry,
        trip_type: travelDetails.tripType,
        start_date: travelDetails.startDate,
        end_date: travelDetails.endDate,
        cover_type: travelDetails.coverType,
        total_price: price,
        status: 'Active',
        payment_status: 'Completed', // Assume payment is successful
        payment_method: paymentMethod,
        payment_reference: paymentReference,
      })
      .select('id')
      .single();

    if (policyError) throw policyError;
    if (!policyData) throw new Error('Failed to create policy record');

    const policyId = policyData.id;
    
    // 2. Create traveler records for each traveler
    for (const traveler of travelDetails.travelers) {
      const { error: travelerError } = await supabase
        .from('traveler_info')
        .insert({
          policy_id: policyId,
          first_name: traveler.firstName,
          last_name: traveler.lastName,
          date_of_birth: traveler.dateOfBirth,
          email: traveler.email,
          phone: traveler.phone,
          emergency_contact: traveler.emergencyContact,
          address: traveler.address,
          passport_number: traveler.passport?.number,
          passport_issue_date: traveler.passport?.issueDate,
          passport_expiry_date: traveler.passport?.expiryDate,
          passport_nationality: traveler.passport?.nationality,
          beneficiary_name: traveler.beneficiary?.name,
          beneficiary_relationship: traveler.beneficiary?.relationship,
          beneficiary_contact: traveler.beneficiary?.contactDetails,
        });

      if (travelerError) throw travelerError;

      // Handle document uploads if available
      if (traveler.documents?.passport) {
        // Upload passport document to Supabase storage
        // This would be implemented in the UI component
      }

      if (traveler.documents?.visa) {
        // Upload visa document to Supabase storage
        // This would be implemented in the UI component
      }
    }
    
    // 3. Create payment transaction record
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        policy_id: policyId,
        user_id: userId,
        amount: price,
        currency: 'USD', // Default currency
        payment_method: paymentMethod,
        status: 'Completed', // Assume payment is successful
        reference: paymentReference || `PMT-${Date.now().toString(36).toUpperCase()}`,
      });

    if (paymentError) throw paymentError;
    
    return { success: true, policyId };
  } catch (error) {
    console.error('Error purchasing insurance plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Upload user profile information
 */
export const updateUserProfile = async (
  userId: string, 
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
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
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
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
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
 * Process payment
 */
export const processPayment = async (
  paymentDetails: {
    userId: string;
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
    // In a real implementation, this would connect to a payment gateway
    // For now, we'll simulate a successful payment
    
    // Generate a unique payment reference
    const paymentReference = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // In real world, here you would call a payment gateway API
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for simulation
    
    if (!isPaymentSuccessful) {
      return { 
        success: false, 
        error: 'Payment failed. Please try again with a different payment method.' 
      };
    }
    
    return {
      success: true,
      reference: paymentReference
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Get user's purchased policies
 */
export const getUserPolicies = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('travel_policies')
      .select(`
        *,
        insurance_plans(name, provider),
        traveler_info(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user policies:', error);
    return [];
  }
};

/**
 * Upload document and get URL
 */
export const uploadDocument = async (
  userId: string,
  policyId: string,
  travelerId: string,
  file: File,
  documentType: 'passport' | 'visa'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${policyId}/${travelerId}/${documentType}_${Date.now()}.${fileExtension}`;
    
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
