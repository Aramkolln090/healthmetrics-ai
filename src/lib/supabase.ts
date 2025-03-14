import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://joljkcnlrkerzcoowqgg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGprY25scmtlcnpjb293cWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTA1NjEsImV4cCI6MjA1NjY2NjU2MX0.OXhcejWbPVvIg12VWe9woy36E10i2hYbUZvWZXaI8X4';

// Create a Supabase client with custom settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'healthmetrics-auth-storage',
    // Increase timeouts to avoid rate limits
    flowType: 'pkce',
  },
  global: {
    fetch: (...args) => {
      const [url, options] = args;
      // Add retry logic for failed requests
      return customFetch(url, options);
    },
  },
});

// Custom fetch function with retry logic
async function customFetch(url: RequestInfo | URL, options: RequestInit = {}) {
  const maxRetries = 3;
  let retries = 0;
  let lastError;

  // Add longer timeout to options
  const timeoutOptions: RequestInit = {
    ...options,
    // Set a longer timeout (30 seconds)
    signal: options.signal || (AbortSignal?.timeout ? AbortSignal.timeout(30000) : undefined),
  };

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, timeoutOptions);
      
      // Only retry on specific status codes
      if (response.status === 429) {
        // If rate limited, wait longer each time
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        const delayMs = retryAfter * 1000 * (retries + 1);
        
        console.log(`Rate limited. Retrying after ${delayMs/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retries++;
        continue;
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      // Only retry on network errors, not on client errors
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        const delayMs = Math.pow(2, retries) * 1000;
        console.log(`Network error. Retrying after ${delayMs/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retries++;
      } else {
        break;
      }
    }
  }
  
  throw lastError || new Error('Failed after retries');
}
