
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';

// Azure AD B2C configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || '63c11526-d1b7-47d8-8889-a6a9b171eff7',
    authority: import.meta.env.VITE_AZURE_AD_AUTHORITY || 'https://insurebuddy.b2clogin.com/insurebuddy.onmicrosoft.com/B2C_1_travel-insurance-app-signin',
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI || window.location.origin,
    knownAuthorities: [import.meta.env.VITE_AZURE_AD_KNOWN_AUTHORITY || 'insurebuddy.b2clogin.com'],
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

// Password reset policy
const passwordResetAuthority = import.meta.env.VITE_AZURE_AD_PASSWORD_RESET_AUTHORITY || 
  'https://insurebuddy.b2clogin.com/insurebuddy.onmicrosoft.com/B2C_1_travel-insurance-app-password-reset';

// Azure Function App configuration
const apiConfig = {
  baseUrl: import.meta.env.VITE_AZURE_FUNCTION_URL || 'https://travel1-insurance-api.azurewebsites.net/api',
  scopes: [(import.meta.env.VITE_AZURE_AD_SCOPE || 'https://insurebuddy.onmicrosoft.com/user_impersonation')],
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
    'access-control-allow-credentials': 'true',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTION',
    'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With'
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

  console.log(`Making ${method} request to ${endpoint} with requiresAuth=${requiresAuth}`);
  
  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    mode: 'cors',
    credentials: 'include',
  };

  const url = `${apiConfig.baseUrl}/${endpoint}`;
  console.log(`Calling Azure Function at: ${url}`);
  
  const response = await fetch(url, options);

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
    console.log('Starting standard login redirect flow...');
    await msalInstance.loginRedirect({
      scopes: apiConfig.scopes,
      redirectUri: window.location.origin + '/auth',
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Initiate password reset
export const initiatePasswordReset = async (email?: string): Promise<void> => {
  try {
    console.log('Starting password reset flow...');
    
    // Configure the password reset request
    const passwordResetRequest = {
      authority: passwordResetAuthority,
      scopes: apiConfig.scopes,
      redirectUri: window.location.origin + '/auth',
    };
    
    // Add login_hint if email is provided to pre-fill the email field
    if (email) {
      Object.assign(passwordResetRequest, {
        loginHint: email
      });
    }
    
    // Start the password reset flow
    await msalInstance.loginRedirect(passwordResetRequest);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Log out user
export const signOut = async (): Promise<void> => {
  try {
    const logoutRequest = {
      account: getActiveAccount() as AccountInfo,
      postLogoutRedirectUri: window.location.origin,
    };
    await msalInstance.logout(logoutRequest);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Log in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    console.log('Starting Google login redirect flow...');
    // For Google login with Azure AD B2C, we need to use the idp parameter
    // Note: This depends on how your Azure B2C tenant is configured for Google
    await msalInstance.loginRedirect({
      scopes: apiConfig.scopes,
      redirectUri: window.location.origin + '/auth',
      extraQueryParameters: {
        idp: 'google.com' // This is the key for Azure B2C to redirect to Google
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Initialize MSAL
export const initializeAuth = (): void => {
  console.log('Initializing MSAL...');
  msalInstance.initialize().then(() => {
    // Handle redirect promise after initialization
    msalInstance.handleRedirectPromise()
      .then(response => {
        console.log('Redirect handled, response:', response ? 'Auth successful' : 'No response');
        
        // Check if we're stuck in a redirect loop
        const currentPath = window.location.pathname;
        const hasAuthParameter = window.location.search.includes('code=') || 
                                 window.location.search.includes('error=');
        
        // If we're on the auth page and there's no auth parameters, and we're authenticated,
        // attempt to redirect to the stored path or home
        if (currentPath === '/auth' && !hasAuthParameter && getActiveAccount()) {
          const redirectPath = sessionStorage.getItem('redirectAfterAuth');
          if (redirectPath) {
            console.log("Auto-redirecting to stored path:", redirectPath);
            window.location.replace(redirectPath);
            sessionStorage.removeItem('redirectAfterAuth');
          } else {
            console.log("No stored path found, redirecting to home");
            window.location.replace('/');
          }
        }
      })
      .catch(error => {
        console.error('Error handling redirect:', error);
      });
  }).catch(error => {
    console.error('MSAL initialization error:', error);
  });
};

// Get current authentication status
export const getAuthStatus = (): boolean => {
  return msalInstance.getAllAccounts().length > 0;
};
