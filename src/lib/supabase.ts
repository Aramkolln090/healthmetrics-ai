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

// Create a Supabase client with custom settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // We will manage token refresh manually to avoid loops
    autoRefreshToken: false,
    persistSession: shouldPersistSession(),
    detectSessionInUrl: true,
    storageKey: 'healthmetrics-auth-storage',
    flowType: 'pkce',
  },
  global: {
    // Add rate limiting tracking
    headers: {
      'x-client-info': 'health-metrics-ai-web-client'
    },
    fetch: (...args) => {
      const [url, options] = args;
      return customFetch(url, options);
    },
  },
  // Add debug logging in development
  ...(import.meta.env.DEV ? { 
    debug: import.meta.env.DEV ? true : false, 
  } : {}),
});

// Track rate limit for token endpoints
const tokenRateLimits = {
  lastCall: 0,
  retryCount: 0,
  isRateLimited: false,
  cooldownEnd: 0,
};

// Custom fetch function with retry logic
async function customFetch(url: RequestInfo | URL, options: RequestInit = {}) {
  const maxRetries = 3;
  let retries = 0;
  let lastError;

  // Check if this is a token refresh request
  const isTokenRefresh = url.toString().includes('/auth/v1/token');
  
  // For token refresh, enforce rate limiting
  if (isTokenRefresh) {
    const now = Date.now();
    
    // If we're in a cool-down period, throw a rate limit error immediately
    if (tokenRateLimits.isRateLimited && now < tokenRateLimits.cooldownEnd) {
      const remainingMs = tokenRateLimits.cooldownEnd - now;
      console.log(`Token refresh in cool-down period. ${Math.ceil(remainingMs/1000)}s remaining.`);
      
      const error = new Error('Request rate limit reached - enforced by client');
      error.name = 'RateLimitError';
      throw error;
    }
    
    // Require at least 1 second between token refresh attempts
    const minInterval = Math.max(1000, tokenRateLimits.retryCount * 5000);
    if (now - tokenRateLimits.lastCall < minInterval) {
      const error = new Error('Too many refresh attempts - throttled by client');
      error.name = 'ThrottleError';
      throw error;
    }
    
    tokenRateLimits.lastCall = now;
  }

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
        // If rate limited and it's a token refresh, set a cool-down period
        if (isTokenRefresh) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
          tokenRateLimits.isRateLimited = true;
          tokenRateLimits.retryCount += 1;
          // Set a minimum cool-down of 30 seconds, increasing with each attempt
          const cooldownMs = Math.max(retryAfter * 1000, 30000) * Math.pow(2, tokenRateLimits.retryCount);
          tokenRateLimits.cooldownEnd = Date.now() + cooldownMs;
          
          console.log(`Token endpoint rate limited. Cooling down for ${cooldownMs/1000}s`);
          
          // Only retry non-token requests
          if (isTokenRefresh) {
            const error = new Error('Request rate limit reached');
            error.name = 'RateLimitError';
            throw error;
          }
        }
        
        // If rate limited, wait longer each time
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        const delayMs = retryAfter * 1000 * (retries + 1);
        
        if (import.meta.env.DEV) {
          console.log(`Rate limited. Retrying after ${delayMs/1000}s...`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retries++;
        continue;
      }
      
      // Reset rate limit state on successful token refresh
      if (isTokenRefresh && response.ok) {
        tokenRateLimits.retryCount = 0;
        tokenRateLimits.isRateLimited = false;
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      // Only retry on network errors, not on client errors
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        const delayMs = Math.pow(2, retries) * 1000;
        if (import.meta.env.DEV) {
          console.log(`Network error. Retrying after ${delayMs/1000}s...`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retries++;
      } else {
        break;
      }
    }
  }
  
  throw lastError || new Error('Failed after retries');
}
