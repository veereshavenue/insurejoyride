
import { getPlanDetails, purchaseInsurancePlan } from '../planService';
import { callAzureFunction } from '@/integrations/azure/client';
import { TravelDetails, PaymentMethod } from '@/types';
import '@types/jest';

// Mock Azure Function call
jest.mock('@/integrations/azure/client', () => ({
  callAzureFunction: jest.fn()
}));

describe('planService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPlanDetails', () => {
    const planId = 'plan-1';
    
    it('should fetch plan details correctly', async () => {
      // Setup mock response
      (callAzureFunction as jest.Mock).mockResolvedValue({
        plan: {
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
        benefits: [
          {
            name: 'Medical Coverage',
            description: 'Covers medical expenses',
            limit: '$5,000',
            is_highlighted: true
          }
        ]
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

      // Verify the Azure function call
      expect(callAzureFunction).toHaveBeenCalledWith('plans/plan-1');
    });

    it('should return null if plan not found', async () => {
      // Setup mock response for missing plan
      (callAzureFunction as jest.Mock).mockResolvedValue({ 
        plan: null, 
        benefits: [] 
      });

      // Call the function
      const result = await getPlanDetails(planId);

      // Verify the result
      expect(result).toBeNull();
    });
    
    it('should throw an error if fetching fails', async () => {
      // Setup mock error
      const error = new Error('Failed to fetch plan details');
      (callAzureFunction as jest.Mock).mockRejectedValue(error);

      // Call the function and expect it to throw
      await expect(getPlanDetails(planId)).rejects.toThrow('Failed to fetch plan details');
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
    
    it('should call the Azure function with the correct parameters', async () => {
      // Setup mock response
      (callAzureFunction as jest.Mock).mockResolvedValue({
        success: true,
        policyId: 'policy-1',
        referenceNumber: 'REF-123'
      });

      // Call the function
      await purchaseInsurancePlan(planId, travelDetails, price, paymentMethod);

      // Verify Azure function was called with correct parameters
      expect(callAzureFunction).toHaveBeenCalledWith('purchase', 'POST', {
        planId,
        travelDetails,
        price,
        paymentMethod,
        paymentReference: undefined
      });
    });
    
    it('should return success response when the Azure function succeeds', async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        policyId: 'policy-1',
        referenceNumber: 'REF-123'
      };
      
      (callAzureFunction as jest.Mock).mockResolvedValue(mockResponse);

      // Call the function
      const result = await purchaseInsurancePlan(planId, travelDetails, price, paymentMethod);

      // Verify the result
      expect(result).toEqual(mockResponse);
    });
    
    it('should return error response when the Azure function fails', async () => {
      // Setup mock error
      const error = new Error('Failed to purchase plan');
      (callAzureFunction as jest.Mock).mockRejectedValue(error);

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
