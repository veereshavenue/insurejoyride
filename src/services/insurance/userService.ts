
import { callAzureFunction } from '@/integrations/azure/client';

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  profileData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone?: string; 
    address?: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const data = await callAzureFunction<{ success: boolean; error?: string }>(
      'user-profile',
      'POST',
      profileData
    );
    
    return data || { success: false, error: 'No response from user profile service' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Get user's purchased policies
 */
export const getUserPolicies = async (): Promise<any[]> => {
  try {
    const policies = await callAzureFunction<any[]>('user/policies');
    return policies || [];
  } catch (error) {
    console.error('Error fetching user policies:', error);
    return [];
  }
};
