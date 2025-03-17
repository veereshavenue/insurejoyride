
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types';

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
