
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const { isAuthenticated, login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      console.log("Auth page detected auth, redirect path:", redirectPath);
      
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      // If no redirect is set yet, store the referrer or a default
      if (!sessionStorage.getItem('redirectAfterAuth')) {
        // Check if we came from another page via state
        const referrer = location.state?.from;
        
        // If we have a referrer that's not /auth, use it
        if (referrer && referrer !== '/auth') {
          console.log("Setting redirect from referrer:", referrer);
          sessionStorage.setItem('redirectAfterAuth', referrer);
        } else {
          // Default to home if no meaningful referrer
          console.log("No specific redirect path, setting to home");
          sessionStorage.setItem('redirectAfterAuth', '/');
        }
      }
      
      await login();
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Similar logic for Google login
      if (!sessionStorage.getItem('redirectAfterAuth')) {
        const referrer = location.state?.from;
        
        if (referrer && referrer !== '/auth') {
          console.log("Setting Google redirect from referrer:", referrer);
          sessionStorage.setItem('redirectAfterAuth', referrer);
        } else {
          console.log("No specific Google redirect path, setting to home");
          sessionStorage.setItem('redirectAfterAuth', '/');
        }
      }
      
      await loginWithGoogle();
    } catch (error) {
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your travel insurance account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full"
            onClick={handleLogin}
          >
            Sign in with Email
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-50 text-gray-500">OR</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="text-red-600" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Secure login powered by Microsoft Azure
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
