
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload document and get URL
 */
export const uploadDocument = async (
  policyId: string,
  travelerId: string,
  file: File,
  documentType: 'passport' | 'visa'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${policyId}/${travelerId}/${documentType}_${Date.now()}.${fileExtension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('travel_documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('travel_documents')
      .getPublicUrl(data.path);
    
    // Update the traveler record with the document URL
    const updateField = documentType === 'passport' ? 'passport_document_url' : 'visa_document_url';
    
    const { error: updateError } = await supabase
      .from('traveler_info')
      .update({ [updateField]: publicUrl })
      .eq('id', travelerId);
    
    if (updateError) throw updateError;
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error(`Error uploading ${documentType} document:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};
