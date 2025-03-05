
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // If authentication is still loading, we could show a loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If no user is logged in, redirect to login page and show toast
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to access this page",
      variant: "destructive",
    });
    
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
