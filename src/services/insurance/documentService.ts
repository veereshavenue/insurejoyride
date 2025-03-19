
import { callAzureFunction } from '@/integrations/azure/client';

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
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('policyId', policyId);
    formData.append('travelerId', travelerId);
    formData.append('documentType', documentType);
    
    // Custom implementation for file upload
    const response = await fetch(`${import.meta.env.VITE_AZURE_FUNCTION_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${await getTokenForRequest()}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error uploading ${documentType} document:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

// Helper function to get token for file upload request
const getTokenForRequest = async (): Promise<string> => {
  try {
    const msalResponse = await import('@/integrations/azure/client').then(module => 
      module.getAuthToken()
    );
    return msalResponse.accessToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Failed to authenticate request');
  }
};
