# Troubleshooting

Quick fixes for common issues.

## Admin actions don’t work

- Check Admin Token matches `INTERNAL_ADMIN_TOKEN` in `.env.local`
- If changed, restart dev server (Ctrl+C → `npm run dev`)

## Changes not visible on live site

- You must click "Trigger Redeploy" in Admin → Content
- Wait 2–3 minutes for Vercel to build

## Centre not found / pages empty

- Ensure the centre was created in Admin → Centres
- Confirm the correct slug (lowercase, no spaces)

## Images not loading

- Use public URLs (https://...)
- Verify CORS or hosting permissions

## Build or type errors

```bash
npm run typecheck
npm run lint
npm run build
```

- Fix what the CLI reports; if error mentions metadataBase, set it in `src/app/layout.tsx` SEO helper or ignore for dev

## Vercel problems

- Re-add env vars for all environments (Prod/Preview/Dev)
- Check Deploy Hook URL is correct

## Still stuck?

- Revisit `docs/ADMIN-GUIDE.md`
- Ask for help with the exact error message/output
