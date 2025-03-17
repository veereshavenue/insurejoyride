
import { PaymentMethod } from '@/types';
import { callAzureFunction } from '@/integrations/azure/client';

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
    
    const data = await callAzureFunction<{
      success: boolean;
      reference?: string;
      error?: string;
    }>('payment/process', 'POST', paymentDetails);
    
    return data || { success: false, error: 'No response from payment service' };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};
