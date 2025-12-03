"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense,useEffect } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get parameters from URL
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const next = searchParams.get('next');
      const redirectTo = searchParams.get('redirect_to') || searchParams.get('redirectTo');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      // Check hash parameters as Supabase recovery links sometimes use hash
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashType = hashParams.get('type');
      const accessToken = hashParams.get('access_token');

      console.log('[Auth Callback] Type:', type || hashType, 'Code:', code ? 'present' : 'missing', 'Access Token:', accessToken ? 'present' : 'missing');

      // Handle OAuth errors
      if (error) {
        console.error('[Auth Callback] OAuth Error:', error, errorDescription);
        router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`);
        return;
      }

      if (code) {
        // Exchange the code for a session (works for both email verification and OAuth)
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('[Auth Callback] Exchange Error:', exchangeError);
          router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`);
          return;
        }

        console.log('[Auth Callback] Session exchanged successfully');

        // Redirect based on type or next parameter
        if (type === 'recovery' || hashType === 'recovery' || redirectTo?.includes('reset-password')) {
          console.log('[Auth Callback] Recovery detected - redirecting to reset password');
          router.push('/reset-password');
        } else if (next) {
          router.push(next);
        } else if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Check user role and redirect appropriately
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session?.user.id)
            .single();

          if (profile?.role === 'superadmin') {
            router.push('/admin');
          } else {
            router.push('/admin'); // Default for edusitepro admins
          }
        }
      } else {
        // No code, redirect to login
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid #fbbf24",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }} />
        <p style={{ color: "#fff", fontSize: 16 }}>Verifying your email...</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid #fbbf24",
          borderRadius: "50%",
          margin: "0 auto 16px"
        }} />
        <p style={{ color: "#fff", fontSize: 16 }}>Loading...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
