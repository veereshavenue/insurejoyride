
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';

// Azure AD B2C configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || 'default-client-id',
    authority: import.meta.env.VITE_AZURE_AD_AUTHORITY || 'https://travelinsurance.b2clogin.com/travelinsurance.onmicrosoft.com/B2C_1_signupsignin',
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI || window.location.origin,
    knownAuthorities: [import.meta.env.VITE_AZURE_AD_KNOWN_AUTHORITY || 'travelinsurance.b2clogin.com'],
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

// Azure Function App configuration
const apiConfig = {
  baseUrl: import.meta.env.VITE_AZURE_FUNCTION_URL || 'https://travel-insurance-api.azurewebsites.net/api',
  scopes: [(import.meta.env.VITE_AZURE_AD_SCOPE || 'https://travelinsurance.onmicrosoft.com/api/user_impersonation')],
};

// MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// API call helper with authentication
export const callAzureFunction = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<T> => {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if authentication is required
  if (requiresAuth) {
    try {
      const account = getActiveAccount();
      
      // Only try to get auth token if there's an active account
      if (account) {
        const authResult = await getAuthToken();
        headers['Authorization'] = `Bearer ${authResult.accessToken}`;
      } else if (requiresAuth) {
        // If auth is required but no account exists, throw error
        throw new Error('No active account! Sign in before calling API.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${apiConfig.baseUrl}/${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `API call failed: ${response.status}`);
  }

  return response.json();
};

// Get auth token for API calls
export const getAuthToken = async (): Promise<AuthenticationResult> => {
  const account = getActiveAccount();
  if (!account) {
    throw new Error('No active account! Sign in before calling API.');
  }

  try {
    const silentRequest = {
      scopes: apiConfig.scopes,
      account,
    };

    return msalInstance.acquireTokenSilent(silentRequest);
  } catch (error) {
    console.log('Silent token acquisition failed, acquiring token using redirect');
    msalInstance.acquireTokenRedirect({
      scopes: apiConfig.scopes,
    });
    throw error;
  }
};

// Get active account
export const getActiveAccount = (): AccountInfo | null => {
  const activeAccounts = msalInstance.getAllAccounts();
  
  if (activeAccounts.length === 0) {
    return null;
  }
  
  return activeAccounts[0];
};

// Log in user
export const signIn = async (): Promise<void> => {
  try {
    await msalInstance.loginRedirect({
      scopes: apiConfig.scopes,
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Log out user
export const signOut = async (): Promise<void> => {
  try {
    const logoutRequest = {
      account: getActiveAccount() as AccountInfo,
    };
    await msalInstance.logout(logoutRequest);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Initialize MSAL
export const initializeAuth = (): void => {
  msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().catch(error => {
      console.error('Error handling redirect:', error);
    });
  });
};

// Get current authentication status
export const getAuthStatus = (): boolean => {
  return msalInstance.getAllAccounts().length > 0;
};

// Log in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    await msalInstance.loginRedirect({
      scopes: apiConfig.scopes,
      loginHint: 'google',
    });
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};
