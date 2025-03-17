
export type CoverageType = 'Worldwide' | 'Schengen' | 'Asia' | 'Others';
export type TripType = 'Single Trip' | 'Annual Multi-Trips';
export type CoverType = 'Individual' | 'Group' | 'Family';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';
export type PaymentMethod = 'Credit Card' | 'PayPal' | 'Bank Transfer';

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

// Database interfaces for Supabase
export interface DbInsurancePlan {
  id: string;
  name: string;
  provider: string;
  base_price: number;
  coverage_limit: string;
  rating: number;
  terms: string;
  exclusions: string[];
  badge?: 'Popular' | 'Best Value' | 'Premium';
  pros: string[];
  cons: string[];
  logo_url?: string;
  created_at?: string;
  is_active: boolean;
}

export interface DbInsuranceBenefit {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  limit: string;
  is_highlighted: boolean;
  created_at?: string;
}

export interface DbUserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbTravelPolicy {
  id: string;
  user_id: string;
  plan_id: string;
  reference_number: string;
  coverage_type: CoverageType;
  origin_country: string;
  destination_country: string;
  trip_type: TripType;
  start_date: string;
  end_date: string;
  cover_type: CoverType;
  total_price: number;
  status: 'Active' | 'Expired' | 'Cancelled';
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbTravelerInfo {
  id: string;
  policy_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email?: string;
  phone?: string;
  emergency_contact?: string;
  address?: string;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  passport_nationality?: string;
  beneficiary_name?: string;
  beneficiary_relationship?: string;
  beneficiary_contact?: string;
  passport_document_url?: string;
  visa_document_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbPaymentTransaction {
  id: string;
  policy_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  created_at?: string;
  updated_at?: string;
}
