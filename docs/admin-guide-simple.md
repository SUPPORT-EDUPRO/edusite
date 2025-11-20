# Admin quick guide (simple)

1. Your password (Admin Token)

- Open .env.local
- Add: INTERNAL_ADMIN_TOKEN=your-strong-password
- Restart: npm run dev

2. Where to start

- Go to /admin (links to Centres and Content)

3. Add a centre (Admin → Centres)

- Enter your Admin Token at the top of the page you open (the field on the form pages uses it automatically for every action).
- In Vercel: create project from this repo, Root Directory = centre-template, add env vars, Deploy.
- Add custom domain in Vercel.
- Create Deploy Hook in Vercel, copy URL.
- Back in Admin → Centres: enter Slug & Name, paste Deploy Hook URL, Save → Trigger Redeploy.

4. Create pages and sections (Admin → Content)

- Enter Admin Token and the Centre Slug, click Load Pages.
- Add Page: slug (e.g. home), Title, (Published), Save Page.
- Select the page from the dropdown.
- Add Section: choose type (Text/Hero/Gallery/Contact), fill fields, Add Section.
- Click Trigger Redeploy.

5. Check the live site

- Open the centre’s domain. You’ll see the published pages and sections.

6. Tips

- If an action says Unauthorized, the Admin Token doesn’t match INTERNAL_ADMIN_TOKEN.
- If live site didn’t change, click Trigger Redeploy again and wait ~30–60s.
- Images: host anywhere public (Supabase Storage/CDN/Cloudinary) and paste the URL.
