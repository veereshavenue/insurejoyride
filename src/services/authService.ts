
import { 
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  createUserProfile,
  getUserProfile,
  updateUserProfile
} from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Partial<Database['public']['Tables']['user_profiles']['Update']>;

/**
 * Register a new user and create their profile
 */
export const registerUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string,
  phone?: string,
  address?: string
) => {
  try {
    // Sign up the user with Supabase Auth
    const { user } = await signUp(email, password);
    
    if (!user?.id) {
      throw new Error('User registration failed');
    }

    // Create the user's profile
    const userProfileData: UserProfileInsert = {
      user_id: user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      address
    };

    await createUserProfile(userProfileData);
    
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login a user
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const { user, session } = await signIn(email, password);
    return { user, session };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get the current user's profile
 */
export const getProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }
    
    const profile = await getUserProfile(user.id);
    return profile;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (updates: UserProfileUpdate) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    const updatedProfile = await updateUserProfile(user.id, updates);
    return updatedProfile;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};
