import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/auth';

import { LoginForm } from './LoginForm';

async function signIn(
  prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/admin');
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900">EduSitePro</h1>
          <p className="text-stone-600">Admin Portal</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-stone-900">Sign in</h2>

          <LoginForm signIn={signIn} />

          <div className="mt-6 text-center text-sm text-stone-600">
            <Link href="/" className="text-amber-600 hover:text-amber-700">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
