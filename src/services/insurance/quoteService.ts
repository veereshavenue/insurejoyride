
import { supabase } from '@/integrations/supabase/client';
import { TravelDetails, InsurancePlan } from '@/types';

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
