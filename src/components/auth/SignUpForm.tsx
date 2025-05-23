
import { useState, useId } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

export function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signUp, signInWithGoogle } = useAuth();
  const id = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setErrorMessage("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      await signUp(email, password);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Sign up error:', error);
      setErrorMessage(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      // Get the current URL for proper redirect
      const redirectUrl = window.location.origin;
      console.log("SignUpForm - Redirecting to:", redirectUrl);
      await signInWithGoogle(redirectUrl);
      // Note: onSuccess will not be called here as the OAuth flow redirects the page
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.message.includes('provider is not enabled')) {
        setErrorMessage('Google authentication is not enabled in this Supabase project. Please enable it in the Supabase dashboard under Authentication > Providers.');
      } else {
        setErrorMessage(error.message || 'Failed to sign up with Google. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
          <svg
            className="stroke-zinc-800 dark:stroke-zinc-100"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-tight">Create an account</h2>
          <p className="text-sm text-muted-foreground">Enter your details to create a new account</p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
              id={`${id}-email`}
              type="email"
              placeholder="hi@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-password`}>Password</Label>
            <Input
              id={`${id}-password`}
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox 
            id={`${id}-terms`} 
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <Label htmlFor={`${id}-terms`} className="font-normal text-muted-foreground">
            I agree to the <a href="#" className="underline hover:no-underline">Terms of Service</a> and <a href="#" className="underline hover:no-underline">Privacy Policy</a>
          </Label>
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !acceptTerms}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">Or</span>
      </div>

      <Button 
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Sign up with Google
      </Button>
    </div>
  );
}
