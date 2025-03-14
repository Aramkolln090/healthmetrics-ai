import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://joljkcnlrkerzcoowqgg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGprY25scmtlcnpjb293cWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTA1NjEsImV4cCI6MjA1NjY2NjU2MX0.OXhcejWbPVvIg12VWe9woy36E10i2hYbUZvWZXaI8X4';

// Determine if persistent storage should be used (default to true)
const shouldPersistSession = () => {
  if (typeof localStorage === 'undefined') return true;
  const persistValue = localStorage.getItem('supabase.auth.token.persistent');
  return persistValue !== 'false'; // Default to true unless explicitly set to false
};

// Create a Supabase client with retry options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic token refresh to manage it ourselves
    autoRefreshToken: false,
    persistSession: shouldPersistSession(),
    detectSessionInUrl: true,
    storageKey: 'healthmetrics-auth-storage',
  },
  global: {
    // Add basic retry logic for network errors
    fetch: (url, options) => {
      return fetch(url, options);
    },
  },
});
