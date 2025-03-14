import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Refs for managing refresh state
  const refreshPromise = useRef<Promise<Session | null> | null>(null);
  const lastRefreshTime = useRef<number>(0);
  const refreshAttempts = useRef<number>(0);
  const refreshTimeout = useRef<NodeJS.Timeout>();
  const isInitialized = useRef<boolean>(false);
  const sessionCache = useRef<Session | null>(null);
  const isRefreshing = useRef<boolean>(false);
  const refreshCooldown = useRef<boolean>(false);
  const lastTokenRefreshedTime = useRef<number>(0);
  
  // Minimum time between consecutive token refreshes (in milliseconds)
  const MIN_REFRESH_INTERVAL = 60000; // 1 minute

  const getBackoffTime = (attempts: number) => {
    // Add jitter to prevent all clients from retrying at the same time
    const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15 multiplier
    // Exponential backoff with max of 60 seconds
    return Math.min(Math.pow(2, attempts) * 1000 * jitter, 60000);
  };

  const refreshSession = useCallback(async (force = false) => {
    const now = Date.now();

    // Prevent refresh loops by ensuring enough time has passed since the last refresh
    if (!force && lastTokenRefreshedTime.current > 0 && 
        now - lastTokenRefreshedTime.current < MIN_REFRESH_INTERVAL) {
      // console.log('Skipping refresh due to cooldown', 
      //   (now - lastTokenRefreshedTime.current) / 1000, 'seconds since last refresh');
      return sessionCache.current || session;
    }
    
    // If we're already refreshing, return the existing promise
    if (isRefreshing.current && refreshPromise.current && !force) {
      return refreshPromise.current;
    }

    // If we're in a cooldown period, don't refresh
    if (refreshCooldown.current && !force) {
      // console.log('Skipping refresh due to cooldown');
      return sessionCache.current || session;
    }

    // If we have a cached session and it's not going to expire in the next 5 minutes, use it
    if (sessionCache.current && !force) {
      const expiresAt = sessionCache.current.expires_at;
      if (expiresAt) {
        const expiryTime = expiresAt * 1000; // Convert to milliseconds
        const timeToExpiry = expiryTime - now;
        if (timeToExpiry > 300000) { // 5 minutes
          return Promise.resolve(sessionCache.current);
        }
      }
    }

    // Don't refresh if we're within the backoff period
    if (!force && now - lastRefreshTime.current < getBackoffTime(refreshAttempts.current)) {
      return sessionCache.current || session;
    }

    // Clear any existing timeout
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    // Set flags to indicate we're refreshing
    isRefreshing.current = true;

    const doRefresh = async () => {
      try {
        // First try to recover session from storage
        const { data: { session: storedSession } } = await supabase.auth.getSession();
        
        if (storedSession) {
          refreshAttempts.current = 0;
          sessionCache.current = storedSession;
          lastTokenRefreshedTime.current = now;
          return storedSession;
        }

        // If no stored session and we've already tried initializing, don't keep trying
        if (isInitialized.current) {
          sessionCache.current = null;
          return null;
        }

        // Only try to refresh if we have a session
        if (session?.refresh_token) {
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          refreshAttempts.current = 0;
          sessionCache.current = newSession;
          lastTokenRefreshedTime.current = now;
          return newSession;
        }

        sessionCache.current = null;
        return null;
      } catch (error) {
        console.error('Auth refresh error:', error);
        
        // Only increment attempts if it's a rate limit error
        if (error instanceof Error && error.message.includes('rate limit')) {
          refreshAttempts.current++;
          const backoffTime = getBackoffTime(refreshAttempts.current);
          console.log(`Auth refresh rate limited. Waiting ${backoffTime/1000}s before retry. Attempt: ${refreshAttempts.current}`);
          
          // Set a cooldown period
          refreshCooldown.current = true;
          setTimeout(() => {
            refreshCooldown.current = false;
          }, backoffTime);
          
          refreshTimeout.current = setTimeout(() => {
            refreshPromise.current = null;
            isRefreshing.current = false;
          }, backoffTime);
        } else {
          console.error('Auth refresh error (non-rate limit):', error);
        }

        // If it's not a rate limit error, or we've exceeded max attempts, clear the session
        if (refreshAttempts.current > 5 || !(error.message?.includes('rate limit'))) {
          setSession(null);
          setUser(null);
          sessionCache.current = null;
          return null;
        }

        throw error;
      } finally {
        lastRefreshTime.current = now;
        isInitialized.current = true;
        // Reset the refreshing flag after a delay to prevent immediate retries
        setTimeout(() => {
          isRefreshing.current = false;
        }, 5000);
      }
    };

    refreshPromise.current = doRefresh();
    return refreshPromise.current;
  }, [session]);

  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Try to get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);
            sessionCache.current = initialSession;
            lastTokenRefreshedTime.current = Date.now();
            
            // Only set up refresh interval if we have a session
            // Refresh every 15 minutes instead of 10
            refreshInterval = setInterval(() => {
              refreshSession();
            }, 900000); // 15 minutes
          } else {
            setSession(null);
            setUser(null);
            sessionCache.current = null;
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
          setSession(null);
          setUser(null);
          sessionCache.current = null;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      // Only log in development
      if (import.meta.env.DEV) {
        console.log('Auth state change:', event);
      }

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Prevent setting state if this event was triggered by our own refresh
        const now = Date.now();
        if (event === 'TOKEN_REFRESHED' && now - lastTokenRefreshedTime.current < 2000) {
          // Skip re-setting state if we just refreshed the token ourselves
          // This prevents refresh loops
          return;
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        sessionCache.current = newSession;
        refreshAttempts.current = 0;
        
        // Update the last refreshed time when we get a token refreshed event
        if (event === 'TOKEN_REFRESHED') {
          lastTokenRefreshedTime.current = now;
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        sessionCache.current = null;
        refreshPromise.current = null;
        refreshAttempts.current = 0;
        lastTokenRefreshedTime.current = 0;
        if (refreshInterval) clearInterval(refreshInterval);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      subscription.unsubscribe();
    };
  }, [refreshSession]);

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
