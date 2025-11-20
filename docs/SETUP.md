# Quick Setup Guide

Minimal, step-by-step setup for EduSitePro.

## 1) Install

```bash
git clone <your-repo-url>
cd edusitepro
npm install
```

## 2) Configure env

Create `.env.local` in project root:

```env
INTERNAL_ADMIN_TOKEN=your-secret
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Optional:

```env
RESEND_API_KEY=<key>
ADMIN_EMAIL=you@example.com
```

## 3) Run locally

```bash
npm run dev
# open http://localhost:3000
```

## 4) Deploy (Vercel)

- New Project → Root Directory: `centre-template`
- Add the same env vars (Production, Preview, Development)
- Create a Deploy Hook (Settings → Git) and keep the URL for the admin panel.

## 5) Next steps

- Read `docs/ADMIN-GUIDE.md` (creating centres, pages, sections)
- Optional: set custom domain on Vercel after first deploy
