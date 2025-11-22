import { redirect } from 'next/navigation';

import { createClient } from '@/lib/auth';

import { LoginForm } from './LoginForm';

async function signIn(
  prevState: { error?: string; redirectTo?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; redirectTo?: string }> {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/admin';

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, redirectTo };
  }

  redirect(redirectTo);
}

async function getOrganizationData(hostname: string) {
  const supabase = createClient();
  
  // Clean hostname (remove port, www, etc)
  const cleanHostname = hostname.replace(/^www\./, '').split(':')[0];
  
  // For localhost development, default to Young Eagles
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
    const { data: org } = await supabase
      .from('organizations')
      .select('custom_domain, slug, name')
      .eq('slug', 'young-eagles')
      .single();
    
    if (org?.custom_domain) {
      return {
        url: `https://${org.custom_domain}`,
        name: org.name,
        isTenant: true
      };
    }
  }
  
  // Try to find organization by custom domain from hostname
  const { data: org } = await supabase
    .from('organizations')
    .select('custom_domain, slug, name')
    .or(`custom_domain.eq.${cleanHostname},slug.eq.${cleanHostname}`)
    .single();

  if (org?.custom_domain) {
    // Return to their custom domain
    return {
      url: `https://${org.custom_domain}`,
      name: org.name,
      isTenant: true
    };
  }

  // Default to EduSitePro home
  return {
    url: '/',
    name: 'EduSitePro',
    isTenant: false
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  // Get hostname from headers to determine organization
  const headersList = await import('next/headers').then(m => m.headers());
  const hostname = headersList.get('host') || 'localhost';
  const orgData = await getOrganizationData(hostname);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">EduSitePro</h1>
          <p className="text-sm sm:text-base text-stone-600 mt-1">Admin Portal</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-stone-900">Sign in</h2>

          <LoginForm signIn={signIn} redirectTo={searchParams.redirect} />

          <div className="mt-6 text-center text-sm text-stone-600">
            <a 
              href={orgData.url} 
              className="text-amber-600 hover:text-amber-700 underline-offset-2 hover:underline"
            >
              {orgData.isTenant ? 'Back to website' : 'Back to home'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
