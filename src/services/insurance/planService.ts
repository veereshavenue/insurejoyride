
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan, InsuranceBenefit, TravelDetails, PaymentMethod } from '@/types';

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
