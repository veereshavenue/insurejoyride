
import { getPlanDetails, purchaseInsurancePlan } from '../planService';
import { supabase } from '@/integrations/supabase/client';
import { TravelDetails, PaymentMethod } from '@/types';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    functions: {
      invoke: jest.fn()
    }
  }
}));

describe('planService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPlanDetails', () => {
    const planId = 'plan-1';
    
    it('should fetch plan details correctly', async () => {
      // Setup mock responses for plan and benefits
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'insurance_plans') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: planId,
                name: 'Basic Plan',
                provider: 'Insurance Co',
                base_price: 100,
                coverage_limit: '$10,000',
                rating: 4.5,
                terms: 'Terms and conditions',
                exclusions: [],
                badge: 'Popular',
                pros: [],
                cons: [],
                logo_url: 'logo.png',
              },
              error: null
            })
          };
        } else if (table === 'insurance_benefits') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: [
                {
                  name: 'Medical Coverage',
                  description: 'Covers medical expenses',
                  limit: '$5,000',
                  is_highlighted: true
                }
              ],
              error: null
            })
          };
        }
        return { select: jest.fn() };
      });

      // Call the function
      const result = await getPlanDetails(planId);

      // Verify the result
      expect(result).toEqual({
        id: planId,
        name: 'Basic Plan',
        provider: 'Insurance Co',
        price: 100,
        benefits: [
          {
            name: 'Medical Coverage',
            description: 'Covers medical expenses',
            limit: '$5,000',
            isHighlighted: true
          }
        ],
        coverageLimit: '$10,000',
        rating: 4.5,
        terms: 'Terms and conditions',
        exclusions: [],
        badge: 'Popular',
        pros: [],
        cons: [],
        logoUrl: 'logo.png',
      });

      // Verify the supabase calls
      expect(supabase.from).toHaveBeenCalledWith('insurance_plans');
      expect(supabase.from).toHaveBeenCalledWith('insurance_benefits');
    });

    it('should return null if plan not found', async () => {
      // Setup mock response for missing plan
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'insurance_plans') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          };
        }
        return { select: jest.fn() };
      });

      // Call the function
      const result = await getPlanDetails(planId);

      // Verify the result
      expect(result).toBeNull();
    });
    
    it('should throw an error if fetching fails', async () => {
      // Setup mock error response
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'insurance_plans') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          };
        }
        return { select: jest.fn() };
      });

      // Call the function and expect it to throw
      await expect(getPlanDetails(planId)).rejects.toThrow('Database error');
    });
  });

  describe('purchaseInsurancePlan', () => {
    const planId = 'plan-1';
    const travelDetails: TravelDetails = {
      coverageType: 'Worldwide',
      originCountry: 'USA',
      destinationCountry: 'France',
      tripType: 'Single Trip',
      startDate: '2025-04-01',
      endDate: '2025-04-10',
      coverType: 'Individual',
      travelers: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        }
      ]
    };
    const price = 100;
    const paymentMethod: PaymentMethod = 'Credit Card';
    
    it('should call the edge function with the correct parameters', async () => {
      // Setup mock response
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          policyId: 'policy-1',
          referenceNumber: 'REF-123'
        },
        error: null
      });

      // Call the function
      await purchaseInsurancePlan(planId, travelDetails, price, paymentMethod);

      // Verify edge function was called with correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith('purchase-plan', {
        body: {
          planId,
          travelDetails,
          price,
          paymentMethod,
          paymentReference: undefined
        }
      });
    });
    
    it('should return success response when the edge function succeeds', async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        policyId: 'policy-1',
        referenceNumber: 'REF-123'
      };
      
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null
      });

      // Call the function
      const result = await purchaseInsurancePlan(planId, travelDetails, price, paymentMethod);

      // Verify the result
      expect(result).toEqual(mockResponse);
    });
    
    it('should return error response when the edge function fails', async () => {
      // Setup mock error response
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Failed to purchase plan' }
      });

      // Call the function
      const result = await purchaseInsurancePlan(planId, travelDetails, price, paymentMethod);

      // Verify the result
      expect(result).toEqual({
        success: false,
        error: 'Failed to purchase plan'
      });
    });
  });
});
