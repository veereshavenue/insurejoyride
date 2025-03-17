
import { getInsuranceQuotes } from '../quoteService';
import { supabase } from '@/integrations/supabase/client';
import { TravelDetails } from '@/types';

// Mock Supabase functions invocation
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    }
  }
}));

describe('getInsuranceQuotes', () => {
  const mockTravelDetails: TravelDetails = {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the edge function with the correct parameters', async () => {
    // Setup mock response
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'plan-1',
          name: 'Basic Plan',
          provider: 'Insurance Co',
          price: 100,
          benefits: [],
          coverageLimit: '$10,000',
          rating: 4.5,
          terms: 'Terms and conditions',
          exclusions: [],
          pros: [],
          cons: [],
        }
      ],
      error: null
    });

    // Call the function
    await getInsuranceQuotes(mockTravelDetails);

    // Verify edge function was called with correct parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'get-insurance-quotes',
      {
        body: { travelDetails: mockTravelDetails }
      }
    );
  });

  it('should return the quotes when the edge function succeeds', async () => {
    // Setup mock response
    const mockQuotes = [
      {
        id: 'plan-1',
        name: 'Basic Plan',
        provider: 'Insurance Co',
        price: 100,
        benefits: [],
        coverageLimit: '$10,000',
        rating: 4.5,
        terms: 'Terms and conditions',
        exclusions: [],
        pros: [],
        cons: [],
      }
    ];
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: mockQuotes,
      error: null
    });

    // Call the function
    const result = await getInsuranceQuotes(mockTravelDetails);

    // Verify the result
    expect(result).toEqual(mockQuotes);
  });

  it('should throw an error when the edge function fails', async () => {
    // Setup mock error response
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch quotes' }
    });

    // Call the function and expect it to throw
    await expect(getInsuranceQuotes(mockTravelDetails)).rejects.toThrow('Failed to fetch quotes');
  });
});
