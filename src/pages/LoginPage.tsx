import React, { useId } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const id = useId();
  
  // Get the location the user was trying to access
  const from = location.state?.from || '/';
  
  // If user is already authenticated, redirect to the page they were trying to access
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSuccess = () => {
    // Navigate to the page the user was trying to access
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-6 shadow-lg">
        <Tabs defaultValue="signIn" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signIn">Sign In</TabsTrigger>
            <TabsTrigger value="signUp">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signIn">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="signUp">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
