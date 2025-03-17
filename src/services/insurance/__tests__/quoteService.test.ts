
import { getInsuranceQuotes } from '../quoteService';
import { callAzureFunction } from '@/integrations/azure/client';
import { TravelDetails } from '@/types';
import '@types/jest';

// Mock Azure Function call
jest.mock('@/integrations/azure/client', () => ({
  callAzureFunction: jest.fn()
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

  it('should call the Azure function with the correct parameters', async () => {
    // Setup mock response
    (callAzureFunction as jest.Mock).mockResolvedValue([
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
    ]);

    // Call the function
    await getInsuranceQuotes(mockTravelDetails);

    // Verify Azure function was called with correct parameters
    expect(callAzureFunction).toHaveBeenCalledWith(
      'quotes',
      'POST',
      { travelDetails: mockTravelDetails }
    );
  });

  it('should return the quotes when the Azure function succeeds', async () => {
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
    
    (callAzureFunction as jest.Mock).mockResolvedValue(mockQuotes);

    // Call the function
    const result = await getInsuranceQuotes(mockTravelDetails);

    // Verify the result
    expect(result).toEqual(mockQuotes);
  });

  it('should throw an error when the Azure function fails', async () => {
    // Setup mock error
    const error = new Error('Failed to fetch quotes');
    (callAzureFunction as jest.Mock).mockRejectedValue(error);

    // Call the function and expect it to throw
    await expect(getInsuranceQuotes(mockTravelDetails)).rejects.toThrow('Failed to fetch quotes');
  });
});
