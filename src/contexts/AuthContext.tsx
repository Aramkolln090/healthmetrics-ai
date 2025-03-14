import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Simple refs to prevent refresh loops
  const lastRefreshTime = useRef<number>(0);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef<boolean>(false);
  
  // Minimum time between refreshes (15 minutes in ms)
  const MIN_REFRESH_INTERVAL = 15 * 60 * 1000;
  
  // Manual refresh function with safeguards
  const refreshToken = async () => {
    const now = Date.now();
    
    // Don't refresh if we've refreshed recently or are already refreshing
    if (isRefreshing.current || (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL)) {
      return;
    }
    
    try {
      isRefreshing.current = true;
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing token:', error);
        
        // If we get a rate limit error, wait longer before trying again
        if (error.message.includes('rate limit')) {
          lastRefreshTime.current = now + 60 * 1000; // Add a minute to prevent immediate retries
        }
        
        // If the error is not recoverable, sign out
        if (!error.message.includes('rate limit')) {
          await supabase.auth.signOut();
        }
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        lastRefreshTime.current = now;
      }
    } catch (error) {
      console.error('Unexpected error during token refresh:', error);
    } finally {
      isRefreshing.current = false;
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        // Check if we have a session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          lastRefreshTime.current = Date.now();
          
          // Set up refresh interval
          refreshInterval.current = setInterval(() => {
            refreshToken();
          }, MIN_REFRESH_INTERVAL);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (import.meta.env.DEV) {
        console.log('Auth state change:', event);
      }

      if (event === 'SIGNED_IN') {
        setSession(newSession);
        setUser(newSession?.user || null);
        lastRefreshTime.current = Date.now();
        
        // Set up refresh interval on sign in
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
        
        refreshInterval.current = setInterval(() => {
          refreshToken();
        }, MIN_REFRESH_INTERVAL);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        
        // Clear refresh interval on sign out
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
          refreshInterval.current = null;
        }
      }
      // Ignore TOKEN_REFRESHED events to prevent loops
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      // Update the local storage setting for session persistence
      if (typeof localStorage !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('supabase.auth.token.persistent', 'true');
        } else {
          localStorage.setItem('supabase.auth.token.persistent', 'false');
        }
      }
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      toast({
        title: "Signed in successfully",
        description: "Welcome back to HealthyAI!"
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as const,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/`
        }
      });
      
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast({
            title: "Google sign in failed",
            description: "Google authentication is not enabled in this Supabase project. Please enable it in the Supabase dashboard under Authentication > Providers.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Google sign in failed",
            description: error.message,
            variant: "destructive"
          });
        }
        throw error;
      }
      
      toast({
        title: "Redirecting to Google",
        description: "Please continue in the Google authentication window"
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      toast({
        title: "Sign up successful",
        description: "Please check your email for a confirmation link."
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
