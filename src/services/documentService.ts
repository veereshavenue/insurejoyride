
import { uploadDocument, getPublicUrl } from '@/lib/supabase';

// Bucket name for travel documents
const TRAVEL_DOCUMENTS_BUCKET = 'travel_documents';

/**
 * Upload a passport document
 */
export const uploadPassport = async (policyId: string, travelerId: string, file: File) => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/passport_${Date.now()}_${file.name}`;
    
    const uploadResult = await uploadDocument(TRAVEL_DOCUMENTS_BUCKET, filePath, file);
    const publicUrl = getPublicUrl(TRAVEL_DOCUMENTS_BUCKET, filePath);
    
    return {
      path: uploadResult.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading passport document:', error);
    throw error;
  }
};

/**
 * Upload a visa document
 */
export const uploadVisa = async (policyId: string, travelerId: string, file: File) => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/visa_${Date.now()}_${file.name}`;
    
    const uploadResult = await uploadDocument(TRAVEL_DOCUMENTS_BUCKET, filePath, file);
    const publicUrl = getPublicUrl(TRAVEL_DOCUMENTS_BUCKET, filePath);
    
    return {
      path: uploadResult.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading visa document:', error);
    throw error;
  }
};

/**
 * Upload a medical document
 */
export const uploadMedicalDocument = async (policyId: string, travelerId: string, file: File) => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/medical_${Date.now()}_${file.name}`;
    
    const uploadResult = await uploadDocument(TRAVEL_DOCUMENTS_BUCKET, filePath, file);
    const publicUrl = getPublicUrl(TRAVEL_DOCUMENTS_BUCKET, filePath);
    
    return {
      path: uploadResult.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading medical document:', error);
    throw error;
  }
};

/**
 * Upload other travel-related documents
 */
export const uploadTravelDocument = async (policyId: string, travelerId: string, documentType: string, file: File) => {
  try {
    // Create a file path that includes policy and traveler IDs for organization
    const filePath = `${policyId}/${travelerId}/${documentType}_${Date.now()}_${file.name}`;
    
    const uploadResult = await uploadDocument(TRAVEL_DOCUMENTS_BUCKET, filePath, file);
    const publicUrl = getPublicUrl(TRAVEL_DOCUMENTS_BUCKET, filePath);
    
    return {
      path: uploadResult.path,
      url: publicUrl
    };
  } catch (error) {
    console.error(`Error uploading ${documentType} document:`, error);
    throw error;
  }
};
