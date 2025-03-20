
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalInstance, getActiveAccount, signIn, signOut, signInWithGoogle, initiatePasswordReset } from '../integrations/azure/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Process redirect after authentication
  const processRedirect = (session: any) => {
    if (!session) return;
    
    // Prevent duplicate redirects
    if (redirectInProgress) return;
    
    const redirectPath = sessionStorage.getItem('redirectAfterAuth');
    console.log("Processing redirect, path:", redirectPath, "current location:", location.pathname);
    
    if (redirectPath && location.pathname === '/auth') {
      console.log("Redirecting to:", redirectPath);
      setRedirectInProgress(true);
      sessionStorage.removeItem('redirectAfterAuth');
      
      // Use navigate with replace to avoid browser history issues
      navigate(redirectPath, { replace: true });
      
      // Reset the redirect flag after a delay
      setTimeout(() => {
        setRedirectInProgress(false);
      }, 500);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Register callback for redirect
        msalInstance.addEventCallback((event: EventMessage) => {
          if (event.eventType === EventType.LOGIN_SUCCESS) {
            const result = event.payload as AuthenticationResult;
            setUser({
              id: result.account?.homeAccountId,
              email: result.account?.username,
              name: result.account?.name || 'User',
            });
            
            // Process the redirect in the callback
            processRedirect(result.account);
          } else if (event.eventType === EventType.LOGOUT_SUCCESS) {
            setUser(null);
          } else if (event.eventType === EventType.LOGIN_FAILURE) {
            console.error("Login failure event:", event.error);
          }
        });

        // Check if user is already logged in
        const account = getActiveAccount();
        if (account) {
          setUser({
            id: account.homeAccountId,
            email: account.username,
            name: account.name || 'User',
          });
          
          // Process the redirect on initial load too
          processRedirect(account);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate, location.pathname]);

  const login = async () => {
    try {
      // Store current path before redirect if we're not already on the auth page
      if (location.pathname !== '/auth') {
        const currentPath = location.pathname + location.search;
        console.log("Storing current path before auth:", currentPath);
        sessionStorage.setItem('redirectAfterAuth', currentPath);
      }
      
      await signIn();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Store current path before redirect if we're not already on the auth page
      if (location.pathname !== '/auth') {
        const currentPath = location.pathname + location.search;
        console.log("Storing current path before Google auth:", currentPath);
        sessionStorage.setItem('redirectAfterAuth', currentPath);
      }
      
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Store the current location for redirect after password reset
      const currentPath = location.pathname !== '/auth' 
        ? location.pathname + location.search 
        : '/';
      
      console.log("Storing path for after password reset:", currentPath);
      sessionStorage.setItem('redirectAfterAuth', currentPath);
      
      await initiatePasswordReset(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
