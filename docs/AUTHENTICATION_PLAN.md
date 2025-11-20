# Authentication System - Implementation Plan

**Priority:** 🔴 CRITICAL  
**Status:** Planning Phase  
**Target:** Week 2 Completion

---

## 🎯 Objective

Implement Supabase Auth to protect admin routes and enable secure multi-user access per tenant.

---

## 🚨 Current Security Issues

1. **Admin routes are publicly accessible** - Anyone can access `/admin/*`
2. **No user authentication** - No login/logout system
3. **No session management** - Can't track who's logged in
4. **No access control** - Can't restrict features by role

---

## 📋 Requirements

### Authentication Flow

- Email/password login
- Magic link (passwordless) login option
- Password reset functionality
- Session persistence
- Auto-redirect after login
- Logout functionality

### Route Protection

- Middleware to protect `/admin/*` routes
- Redirect unauthenticated users to `/admin/login`
- Preserve intended destination after login

### User Management

- User registration for centre owners
- User profiles with tenant association
- Role-based access (owner, editor, viewer)
- Multi-user support per tenant

---

## 🏗️ Technical Architecture

### 1. Supabase Auth Setup

```sql
-- Users table (built-in to Supabase Auth)
-- Already includes: id, email, encrypted_password, etc.

-- User profiles table (extend auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Auth Middleware

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect /admin routes (except /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (session) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return res;
    }

    // Require auth for all other /admin routes
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}
```

### 3. Login Page

```typescript
// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    // Login form UI
  );
}
```

### 4. Auth Context Provider

```typescript
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 📦 Required Packages

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

---

## 🎨 UI Components Needed

1. **Login Page** (`/admin/login`)
   - Email/password form
   - Magic link option
   - "Forgot password" link
   - Error handling

2. **Password Reset Page** (`/admin/reset-password`)
   - Email input
   - Confirmation message

3. **User Profile Menu** (in AdminLayout header)
   - Display user name/email
   - Logout button
   - Settings link

4. **Protected Route Wrapper**
   - Show loading state
   - Redirect if not authenticated

---

## 🔐 Security Considerations

1. **RLS Policies**: Ensure all tenant data is protected by user's tenant_id
2. **Session Expiry**: Configure appropriate session duration
3. **CSRF Protection**: Supabase handles this automatically
4. **Password Requirements**: Enforce strong passwords
5. **Rate Limiting**: Protect against brute force attacks

---

## 📝 Implementation Steps

### Phase 1: Basic Auth (Day 1)

1. Install Supabase auth packages
2. Create login page UI
3. Implement email/password login
4. Add auth middleware to protect routes
5. Add logout functionality

### Phase 2: User Management (Day 2)

6. Create user_profiles table
7. Build user profile management
8. Add user registration flow
9. Implement password reset

### Phase 3: Multi-User (Day 3)

10. Add role-based access control
11. Create user invitation system
12. Build team management UI
13. Add activity logging

---

## ✅ Acceptance Criteria

- [ ] `/admin/*` routes require authentication
- [ ] Users can log in with email/password
- [ ] Users can log in with magic link
- [ ] Users can reset their password
- [ ] Sessions persist across page reloads
- [ ] Logout works correctly
- [ ] Users see their name/email in header
- [ ] Unauthenticated users redirected to login
- [ ] After login, users go to intended page
- [ ] RLS policies protect all tenant data

---

## 🧪 Testing Checklist

- [ ] Try accessing /admin without login → redirects to /admin/login
- [ ] Login with valid credentials → redirects to /admin
- [ ] Login with invalid credentials → shows error
- [ ] Logout → redirects to login page
- [ ] Session persists after page refresh
- [ ] Magic link email sends successfully
- [ ] Password reset email sends successfully
- [ ] Can't access other tenant's data
- [ ] Role-based permissions work correctly

---

## 📚 Documentation Needed

1. **User Guide**: How to log in and manage account
2. **Admin Guide**: How to invite team members
3. **Dev Guide**: How auth system works
4. **Deployment Guide**: Environment variables needed

---

## 🚀 Deployment Notes

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Dashboard Setup

1. Enable Email Auth provider
2. Configure email templates
3. Set up OAuth providers (optional)
4. Configure session settings
5. Test email delivery

---

**Next Action:** Begin Phase 1 implementation after approval
