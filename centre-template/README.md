# Centre Website Template

This is the minimal template used to create each centre’s public website. It reads published content from the Hub’s Supabase and builds static pages for the centre.

How to create a new site (per centre)

1. In Vercel

- New Project → Import the SAME repo
- Root Directory: centre-template
- Framework Preset: Next.js
- Environment Variables (Production + Preview + Development):
  - NEXT_PUBLIC_SUPABASE_URL = https://<your-supabase-ref>.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY = <your anon key>
  - CENTRE_SLUG = <centre-slug> (exact slug you created in the Hub)
- Deploy

2. Custom domain

- Vercel → Project → Domains → Add the centre’s domain
- Ask the centre to set DNS (CNAME to cname.vercel-dns.com or A 76.76.21.21)
- Wait for verification

3. Deploy Hook (for updates from the Hub)

- Vercel → Project → Settings → Git → Deploy Hooks → Create Hook
- Copy the Deploy Hook URL
- Go to the Hub → Admin → Centres → paste Deploy Hook URL → Save
- When you update content in the Hub, click “Trigger Redeploy” to rebuild this site

Notes

- The site fetches only PUBLISHED content (pages/sections) for CENTRE_SLUG.
- No authentication is needed for visitors; RLS allows public SELECT on published data only.
- You can style/brand this template further if needed.
