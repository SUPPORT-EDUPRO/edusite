"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the code from URL (for email verification)
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect_to') || searchParams.get('redirectTo');

      console.log('[Auth Callback] Type:', type, 'Code:', code ? 'present' : 'missing');

      if (code) {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('[Auth Callback] Error:', error);
          router.push(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }

        console.log('[Auth Callback] Session exchanged successfully');

        // Redirect based on type
        if (type === 'recovery' || redirectTo?.includes('reset-password')) {
          router.push('/reset-password');
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
            router.push('/dashboard');
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
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
