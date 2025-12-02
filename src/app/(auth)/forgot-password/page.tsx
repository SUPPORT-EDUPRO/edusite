"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setLoading(false);

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link');
        return;
      }

      setSuccess(true);
    } catch (error: any) {
      setLoading(false);
      setError('Failed to send reset link. Please try again.');
      console.error('[Forgot Password] Error:', error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">EduSitePro</h1>
          <p className="text-sm sm:text-base text-stone-600 mt-1">Admin Portal</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl sm:text-2xl font-bold text-stone-900">Check your email</h2>
              <p className="mb-6 text-sm sm:text-base text-stone-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="mb-6 text-sm text-stone-500">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-lg bg-amber-600 px-6 py-3 text-base font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-xl sm:text-2xl font-bold text-stone-900">Forgot Password?</h2>
              <p className="mb-6 text-sm sm:text-base text-stone-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2.5 sm:px-4 sm:py-3 text-base text-stone-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-amber-600 px-4 py-3 sm:py-3.5 text-base sm:text-lg font-semibold text-white hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
