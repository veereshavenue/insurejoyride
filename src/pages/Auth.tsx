
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const { isAuthenticated, login, loginWithGoogle, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectProcessed, setRedirectProcessed] = useState(false);
  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "reset">("signin");
  const [processingAuth, setProcessingAuth] = useState(false);

  useEffect(() => {
    // Only process auth redirect once to prevent infinite loops
    if (isAuthenticated && !redirectProcessed) {
      setRedirectProcessed(true);
      
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      console.log("Auth page detected auth, redirect path:", redirectPath);
      
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterAuth');
        console.log("Navigating to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        // Default to home if no redirect path
        console.log("No redirect path found, going home");
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, redirectProcessed]);

  // Check for authentication params in URL
  useEffect(() => {
    const hasAuthParams = location.search.includes('code=') || 
                         location.search.includes('error=') ||
                         location.search.includes('state=');
    
    if (hasAuthParams) {
      console.log("Auth parameters detected in URL, auth process in progress");
      setProcessingAuth(true);
    } else {
      setProcessingAuth(false);
    }
  }, [location.search]);

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

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password",
        variant: "destructive"
      });
      return;
    }

    try {
      await resetPassword(email);
      toast({
        title: "Password reset initiated",
        description: "Check your email for instructions to reset your password",
      });
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  if (loading || processingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">
            {processingAuth ? "Processing authentication..." : "Loading..."}
          </h2>
          <p className="text-gray-600">Please wait, this may take a moment</p>
          <div className="mt-4 w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If already authenticated, show a message while the redirect happens
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Already authenticated</h2>
          <p className="text-gray-600">Redirecting you...</p>
          <div className="mt-4 w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
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
          <Tabs 
            value={authMode} 
            onValueChange={(value) => setAuthMode(value as "signin" | "reset")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="reset" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full"
                onClick={handlePasswordReset}
              >
                Reset Password
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setAuthMode("signin")}
              >
                Back to Sign In
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Secure login powered by Microsoft Azure
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
