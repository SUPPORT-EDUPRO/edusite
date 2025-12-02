'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createClient } from '@/lib/supabase-client';

interface LoginFormProps {
  signIn: (
    prevState: { error?: string; redirectTo?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string; redirectTo?: string }>;
  redirectTo?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-amber-600 px-4 py-3 sm:py-3.5 text-base sm:text-lg font-semibold text-white hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}

export function LoginForm({ signIn, redirectTo }: LoginFormProps) {
  const [state, formAction] = useFormState(signIn, undefined);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${redirectTo || '/admin'}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      // Browser will redirect automatically
    } catch (err: any) {
      console.error('[GoogleSignIn] Error:', err);
      setGoogleError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <form action={formAction} className="space-y-4 sm:space-y-5">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 text-sm text-red-800">
            {state.error}
          </div>
        )}

        {googleError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 text-sm text-red-800">
            {googleError}
          </div>
        )}

        <input type="hidden" name="redirectTo" value={redirectTo || '/admin'} />

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 sm:px-4 sm:py-3 text-base text-stone-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <a 
              href="/forgot-password" 
              className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 sm:px-4 sm:py-3 text-base text-stone-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-colors"
          />
        </div>

        <SubmitButton />
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-stone-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 sm:py-3.5 text-base sm:text-lg font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center gap-3"
      >
        {googleLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-amber-600" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>
    </div>
  );
}
