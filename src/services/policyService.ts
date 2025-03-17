import { 
  getCurrentUser,
  getInsurancePlans,
  getInsurancePlan,
  createTravelPolicy,
  getUserPolicies as fetchUserPolicies,
  createTravelerInfo,
  createPaymentTransaction
} from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

export type InsurancePlan = Database['public']['Tables']['insurance_plans']['Row'] & {
  insurance_benefits: Database['public']['Tables']['insurance_benefits']['Row'][]
};

export type TravelPolicy = Database['public']['Tables']['travel_policies']['Row'];
export type TravelPolicyInsert = Database['public']['Tables']['travel_policies']['Insert'];

export type TravelerInfo = Database['public']['Tables']['traveler_info']['Row'];
export type TravelerInfoInsert = Database['public']['Tables']['traveler_info']['Insert'];

export type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row'];
export type PaymentTransactionInsert = Database['public']['Tables']['payment_transactions']['Insert'];

/**
 * Get all available insurance plans with their benefits
 */
export const getAvailableInsurancePlans = async (): Promise<InsurancePlan[]> => {
  try {
    const plans = await getInsurancePlans();
    return plans as unknown as InsurancePlan[];
  } catch (error) {
    console.error('Error fetching insurance plans:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific plan
 */
export const getPlanDetails = async (planId: string): Promise<InsurancePlan> => {
  try {
    const plan = await getInsurancePlan(planId);
    return plan as unknown as InsurancePlan;
  } catch (error) {
    console.error(`Error fetching plan details for ${planId}:`, error);
    throw error;
  }
};

/**
 * Create a new travel insurance policy
 */
export const purchaseInsurancePolicy = async (
  planId: string,
  coverageType: string,
  originCountry: string,
  destinationCountry: string,
  tripType: string,
  startDate: string,
  endDate: string,
  coverType: string,
  totalPrice: number,
  paymentMethod: string
): Promise<TravelPolicy> => {
  try {
    const { data, error } = await getCurrentUser();
    if (error || !data.user) {
      throw new Error('No authenticated user found');
    }
    
    // Generate a unique reference number
    const referenceNumber = `INS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create the policy
    const policyData: TravelPolicyInsert = {
      user_id: data.user.id,
      plan_id: planId,
      reference_number: referenceNumber,
      coverage_type: coverageType,
      origin_country: originCountry,
      destination_country: destinationCountry,
      trip_type: tripType,
      start_date: startDate,
      end_date: endDate,
      cover_type: coverType,
      total_price: totalPrice,
      status: 'Active',
      payment_status: 'Paid',
      payment_method: paymentMethod,
      payment_reference: `PAY-${Date.now().toString().slice(-6)}`
    };
    
    const newPolicy = await createTravelPolicy(policyData);
    
    // Create payment transaction record
    const transactionData: PaymentTransactionInsert = {
      policy_id: newPolicy.id,
      user_id: data.user.id,
      amount: totalPrice,
      currency: 'USD',
      payment_method: paymentMethod,
      status: 'Completed',
      reference: `TRX-${Date.now().toString().slice(-6)}`
    };
    
    await createPaymentTransaction(transactionData);
    
    return newPolicy;
  } catch (error) {
    console.error('Error purchasing insurance policy:', error);
    throw error;
  }
};

/**
 * Add traveler information to a policy
 */
export const addTravelerInfo = async (
  policyId: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  email?: string,
  phone?: string,
  emergencyContact?: string,
  address?: string,
  passportNumber?: string,
  passportIssueDate?: string,
  passportExpiryDate?: string,
  passportNationality?: string,
  beneficiaryName?: string,
  beneficiaryRelationship?: string,
  beneficiaryContact?: string
): Promise<TravelerInfo> => {
  try {
    const travelerData: TravelerInfoInsert = {
      policy_id: policyId,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      email,
      phone,
      emergency_contact: emergencyContact,
      address,
      passport_number: passportNumber,
      passport_issue_date: passportIssueDate,
      passport_expiry_date: passportExpiryDate,
      passport_nationality: passportNationality,
      beneficiary_name: beneficiaryName,
      beneficiary_relationship: beneficiaryRelationship,
      beneficiary_contact: beneficiaryContact
    };
    
    const newTravelerInfo = await createTravelerInfo(travelerData);
    return newTravelerInfo;
  } catch (error) {
    console.error('Error adding traveler information:', error);
    throw error;
  }
};

/**
 * Get all policies for the current user
 */
export const getUserInsurancePolicies = async () => {
  try {
    const { data, error } = await getCurrentUser();
    if (error || !data.user) {
      throw new Error('No authenticated user found');
    }
    
    const policies = await fetchUserPolicies(data.user.id);
    return policies;
  } catch (error) {
    console.error('Error fetching user policies:', error);
    throw error;
  }
};
