'use client';

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
  );
}
