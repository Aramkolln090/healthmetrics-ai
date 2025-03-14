import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  useEffect(() => {
    // Only show the toast once when we're sure the user is not authenticated
    if (!isLoading && !user && !hasShownToast) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      setHasShownToast(true);
    }
    
    // Reset the toast flag if the user becomes authenticated
    if (user) {
      setHasShownToast(false);
    }
  }, [user, isLoading, toast, hasShownToast]);
  
  // If authentication is still loading, show a loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If no user is logged in, redirect to login page
  if (!user || !session) {
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
