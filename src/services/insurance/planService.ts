
import { InsurancePlan, InsuranceBenefit, TravelDetails, PaymentMethod } from '@/types';
import { callAzureFunction } from '@/integrations/azure/client';

/**
 * Get details of a specific insurance plan
 */
export const getPlanDetails = async (planId: string): Promise<InsurancePlan | null> => {
  try {
    console.log('Fetching details for plan:', planId);
    
    const planData = await callAzureFunction<{
      plan: any,
      benefits: Array<{
        name: string;
        description: string;
        limit: string;
        is_highlighted: boolean;
      }>
    }>(`plans/${planId}`);
    
    if (!planData || !planData.plan) {
      console.log('No plan found with ID:', planId);
      return null;
    }

    console.log('Plan details fetched:', planData);

    const benefits: InsuranceBenefit[] = (planData.benefits || []).map(benefit => ({
      name: benefit.name,
      description: benefit.description,
      limit: benefit.limit,
      isHighlighted: benefit.is_highlighted,
    }));

    return {
      id: planData.plan.id,
      name: planData.plan.name,
      provider: planData.plan.provider,
      price: planData.plan.base_price, // This is the base price, final would be calculated
      benefits,
      coverageLimit: planData.plan.coverage_limit,
      rating: planData.plan.rating,
      terms: planData.plan.terms,
      exclusions: planData.plan.exclusions || [],
      badge: planData.plan.badge as ('Popular' | 'Best Value' | 'Premium' | undefined),
      pros: planData.plan.pros || [],
      cons: planData.plan.cons || [],
      logoUrl: planData.plan.logo_url,
    };
  } catch (error) {
    console.error('Error fetching plan details:', error);
    throw error; // Re-throw the error for proper error handling
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
    
    const data = await callAzureFunction<{
      success: boolean;
      policyId?: string;
      referenceNumber?: string;
      error?: string;
    }>('purchase', 'POST', {
      planId,
      travelDetails,
      price,
      paymentMethod,
      paymentReference
    });
    
    return data || { success: false, error: 'No response from purchase service' };
  } catch (error) {
    console.error('Error purchasing insurance plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};
