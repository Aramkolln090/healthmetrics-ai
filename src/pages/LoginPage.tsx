
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If user is already authenticated, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to HealthyAI</h1>
          <p className="mt-2 text-muted-foreground">Sign in or create an account to continue</p>
        </div>

        <Tabs defaultValue="signIn" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signIn" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signUp" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signIn" className="pt-4">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="signUp" className="pt-4">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
