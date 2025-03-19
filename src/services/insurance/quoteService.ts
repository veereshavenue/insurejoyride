
import { TravelDetails, InsurancePlan } from '@/types';
import { callAzureFunction } from '@/integrations/azure/client';

/**
 * Fetch insurance quotes based on travel details
 */
export const getInsuranceQuotes = async (travelDetails: TravelDetails): Promise<InsurancePlan[]> => {
  try {
    console.log('Calling get-insurance-quotes Azure function with travel details:', JSON.stringify(travelDetails, null, 2));
    
    // Set requiresAuth to false since we want to allow unauthenticated users to get quotes
    const data = await callAzureFunction<InsurancePlan[]>('getQuotes', 'POST', travelDetails, false);
    
    if (!data || data.length === 0) {
      console.warn('No data returned from get-insurance-quotes Azure function');
      return [];
    }
    
    console.log(`Received ${data.length} quotes from Azure function`);
    return data;
  } catch (error) {
    console.error('Error in getInsuranceQuotes service:', error);
    throw error;
  }
};
