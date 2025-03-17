
export type CoverageType = 'Worldwide' | 'Schengen' | 'Asia' | 'Others';
export type TripType = 'Single Trip' | 'Annual Multi-Trips';
export type CoverType = 'Individual' | 'Group' | 'Family';

export interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  address?: string;
  passport?: {
    number: string;
    issueDate: string;
    expiryDate: string;
    nationality: string;
  };
  beneficiary?: {
    name: string;
    relationship: string;
    contactDetails: string;
  };
  documents?: {
    passport?: File | null;
    visa?: File | null;
  };
}

export interface TravelDetails {
  coverageType: CoverageType;
  originCountry: string;
  destinationCountry: string;
  tripType: TripType;
  startDate: string;
  endDate: string;
  coverType: CoverType;
  travelers: Traveler[];
}

export interface InsuranceBenefit {
  name: string;
  description: string;
  limit: string;
  isHighlighted?: boolean;
}

export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  price: number;
  benefits: InsuranceBenefit[];
  coverageLimit: string;
  rating: number;
  terms: string;
  exclusions: string[];
  badge?: 'Popular' | 'Best Value' | 'Premium';
  pros: string[];
  cons: string[];
  logoUrl?: string;
}

export interface ComparisonItem {
  planId: string;
  name: string;
  provider: string;
  price: number;
  selected: boolean;
}

export interface FormState {
  step: number;
  travelDetails: TravelDetails;
  loading: boolean;
  insurancePlans: InsurancePlan[];
  selectedPlans: ComparisonItem[];
  selectedPlan: InsurancePlan | null;
  paymentComplete: boolean;
}
