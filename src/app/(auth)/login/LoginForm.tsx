'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4 sm:space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 text-sm text-red-800">
          {state.error}
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
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 sm:px-4 sm:py-3 pr-12 text-base text-stone-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
