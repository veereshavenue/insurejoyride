
import { supabase } from '@/integrations/supabase/client';
import { InsurancePlan, TravelDetails } from '@/types';

/**
 * Fetch insurance quotes based on travel details
 */
export const getInsuranceQuotes = async (travelDetails: TravelDetails): Promise<InsurancePlan[]> => {
  try {
    console.log('Calling get-insurance-quotes edge function with travel details:', JSON.stringify(travelDetails, null, 2));
    
    const { data, error } = await supabase.functions.invoke('get-insurance-quotes', {
      body: { travelDetails }
    });
    
    if (error) {
      console.error('Error from get-insurance-quotes edge function:', error);
      throw new Error(error.message || 'Failed to fetch insurance quotes');
    }
    
    if (!data) {
      console.warn('No data returned from get-insurance-quotes edge function');
      return [];
    }
    
    console.log(`Received ${data.length} quotes from edge function`);
    return data as InsurancePlan[];
  } catch (error) {
    console.error('Error in getInsuranceQuotes service:', error);
    throw error;
  }
};
