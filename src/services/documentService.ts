
import { supabase } from '@/lib/supabase';

// Bucket name for travel documents
const TRAVEL_DOCUMENTS_BUCKET = 'travel_documents';

/**
 * Upload a passport document
 */
export const uploadPassport = async (policyId: string, travelerId: string, file: File): Promise<{path: string, url: string} | null> => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/passport_${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .getPublicUrl(data.path);
    
    // Update the traveler record with the document URL
    const { error: updateError } = await supabase
      .from('traveler_info')
      .update({ passport_document_url: publicUrl })
      .eq('id', travelerId);
    
    if (updateError) throw updateError;
    
    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading passport document:', error);
    return null;
  }
};

/**
 * Upload a visa document
 */
export const uploadVisa = async (policyId: string, travelerId: string, file: File): Promise<{path: string, url: string} | null> => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/visa_${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .getPublicUrl(data.path);
    
    // Update the traveler record with the document URL
    const { error: updateError } = await supabase
      .from('traveler_info')
      .update({ visa_document_url: publicUrl })
      .eq('id', travelerId);
    
    if (updateError) throw updateError;
    
    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading visa document:', error);
    return null;
  }
};

/**
 * Upload a medical document
 */
export const uploadMedicalDocument = async (policyId: string, travelerId: string, file: File): Promise<{path: string, url: string} | null> => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/medical_${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .getPublicUrl(data.path);
    
    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading medical document:', error);
    return null;
  }
};

/**
 * Upload other travel-related documents
 */
export const uploadTravelDocument = async (policyId: string, travelerId: string, documentType: string, file: File): Promise<{path: string, url: string} | null> => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/${documentType}_${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(TRAVEL_DOCUMENTS_BUCKET)
      .getPublicUrl(data.path);
    
    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error(`Error uploading ${documentType} document:`, error);
    return null;
  }
};
