
import { supabase } from '@/integrations/supabase/client';

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
    // Check if profile exists
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', data.user.id);

      if (updateError) throw updateError;
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
        });

      if (insertError) throw insertError;
    }
    
    return { success: true };
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
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error('User not authenticated');
    }
    
    const { data: policies, error: policiesError } = await supabase
      .from('travel_policies')
      .select(`
        *,
        insurance_plans(name, provider),
        traveler_info(*)
      `)
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false });

    if (policiesError) throw policiesError;
    
    return policies || [];
  } catch (error) {
    console.error('Error fetching user policies:', error);
    return [];
  }
};
