"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    // Check if user came from password reset email
    const checkSession = async () => {
      // Try to get email from URL parameters if available
      const urlParams = new URLSearchParams(window.location.search);
      const emailFromUrl = urlParams.get('email');
      if (emailFromUrl) {
        setUserEmail(emailFromUrl);
      }
      
      // Also check hash parameters (Supabase sometimes uses hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const emailFromHash = hashParams.get('email');
      if (emailFromHash) {
        setUserEmail(emailFromHash);
      }
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // First, try to exchange the code from URL if present
      // This happens automatically with detectSessionInUrl: true in the client config
      
      // Small delay to allow URL session detection to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message || "Invalid or expired reset link. Please request a new password reset.");
        return;
      }
      
      if (session && session.user) {
        setValidSession(true);
        setUserEmail(session.user.email || null);
      } else {
        // No valid session, but we might have email from URL
        if (!userEmail) {
          setError("Invalid or expired reset link. Please request a new password reset.");
        } else {
          setError("Invalid or expired reset link. Click below to request a new link.");
        }
      }
    };
    
    checkSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });
    
    setLoading(false);
    
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    
    // Sign out to clear any existing session, then redirect to login
    await supabase.auth.signOut();
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  async function requestNewLink() {
    const emailToUse = userEmail || manualEmail;
    if (!emailToUse) {
      setShowEmailInput(true);
      return;
    }
    
    setResendLoading(true);
    setResendSuccess(false);
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery&redirect_to=/reset-password`,
    });
    
    setResendLoading(false);
    
    if (resetError) {
      setError(resetError.message);
      return;
    }
    
    setResendSuccess(true);
    setShowEmailInput(false);
  }

  if (!validSession && !error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ color: "#fff", fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>
      <div style={{ width: "100%", maxWidth: "500px", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", padding: "40px 5%", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", boxSizing: "border-box", margin: "20px" }}>
          {/* Header with EduSitePro branding */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>
              🔑
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Set Your Password</h1>
            {userEmail && (
              <div style={{ 
                background: "rgba(245, 158, 11, 0.1)", 
                border: "1px solid rgba(245, 158, 11, 0.3)", 
                borderRadius: 8, 
                padding: "10px 16px", 
                marginTop: 12,
                marginBottom: 8
              }}>
                <p style={{ color: "#9CA3AF", fontSize: 12, margin: 0, marginBottom: 4 }}>Setting password for:</p>
                <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600, margin: 0 }}>{userEmail}</p>
              </div>
            )}
            <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
              Welcome to EduSitePro Admin! Create a secure password to access your organization dashboard.
            </p>
          </div>

          {!validSession ? (
            <div>
              <div style={{ padding: 12, background: "rgba(220, 38, 38, 0.2)", border: "1px solid rgba(220, 38, 38, 0.4)", borderRadius: 8, marginBottom: 20 }}>
                <p style={{ color: "#fca5a5", fontSize: 14, margin: 0, marginBottom: 8 }}>{error}</p>
                {userEmail && !resendSuccess && (
                  <p style={{ color: "#d1d5db", fontSize: 13, margin: 0 }}>
                    <button
                      onClick={requestNewLink}
                      disabled={resendLoading}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fbbf24",
                        textDecoration: "underline",
                        cursor: resendLoading ? "not-allowed" : "pointer",
                        padding: 0,
                        fontSize: 13,
                        fontFamily: "inherit"
                      }}
                    >
                      {resendLoading ? "Sending new link..." : "Click here to request a new reset link"}
                    </button>
                  </p>
                )}
              </div>
              
              {resendSuccess && (
                <div style={{ padding: 12, background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", borderRadius: 8, marginTop: 16 }}>
                  <p style={{ color: "#86efac", fontSize: 14, margin: 0 }}>
                    ✉️ Check your email! We've sent a new password reset link to <strong>{userEmail}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Password Reset Successfully!</h2>
              <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Your password has been updated. Redirecting you to the login page...
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={8}
                    style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, paddingRight: 40, boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, color: "#9CA3AF", cursor: "pointer", fontSize: 18 }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <p style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>Must be at least 8 characters</p>
              </div>

              <div>
                <label style={{ display: "block", color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={8}
                  style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              {error && (
                <div style={{ padding: 12, background: "rgba(220, 38, 38, 0.2)", border: "1px solid rgba(220, 38, 38, 0.4)", borderRadius: 8 }}>
                  <p style={{ color: "#fca5a5", fontSize: 14, margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: loading ? "rgba(107, 114, 128, 0.5)" : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                  color: loading ? "#9CA3AF" : "#fff",
                  border: 0,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(245, 158, 11, 0.4)",
                }}
              >
          {!success && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              {showEmailInput && !userEmail ? (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 8, textAlign: "left" }}>
                    Enter your email to request a new reset link:
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 14,
                      marginBottom: 12,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ) : null}
              <button
                onClick={requestNewLink}
                disabled={resendLoading || (!userEmail && !manualEmail && !showEmailInput)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(59, 130, 246, 0.1)",
                  color: resendLoading ? "#6B7280" : "#60A5FA",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: resendLoading || (!userEmail && !manualEmail && !showEmailInput) ? "not-allowed" : "pointer",
                  marginBottom: 16,
                }}
              >
                {resendLoading ? "Sending..." : showEmailInput && !userEmail ? "Send Reset Link" : "Request New Reset Link"}
              </button>
            </div>
          )}    }}
              >
                {resendLoading ? "Sending..." : "Request New Reset Link"}
              </button>
            </div>
          )}

          <div style={{ marginTop: 8, textAlign: "center" }}>
            <a
              href="/login"
              style={{
                display: "inline-block",
                color: "#60A5FA",
                fontSize: 14,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              ← Back to Sign In
            </a>
          </div>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <p style={{ color: "#9CA3AF", fontSize: 12 }}>
              Need help?{" "}
              <a href="https://wa.me/27674770975" style={{ color: "#fbbf24", textDecoration: "none" }}>
                WhatsApp Support
              </a>
            </p>
          </div>
        </div>
      </div>
  );
}
