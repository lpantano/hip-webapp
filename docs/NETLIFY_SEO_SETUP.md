# Netlify SEO Setup - Quick Reference

## TL;DR

Your Netlify build already has everything it needs! The environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` should already be configured in Netlify.

## Verify Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Navigate to **Site Settings** → **Environment Variables**
4. Check that these exist:
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`

If they're already there (which they should be for your app to work), **no action needed!** The sitemap will automatically include all claim pages.

## Build Behavior

### With Environment Variables (Normal)
```
npm run build
  → Runs generate:sitemap
    → Fetches all claims from Supabase
    → Generates sitemap with static + dynamic pages
  → Runs vite build
    → Creates production bundle
```

**Output:** Full sitemap with all pages including individual claims

### Without Environment Variables (Fallback)
```
npm run build
  → Runs generate:sitemap
    → ⚠️  Warning: Missing Supabase credentials
    → Generates sitemap with static pages only
  → Runs vite build
    → Creates production bundle
```

**Output:** Sitemap with only static routes (9 pages)

## Troubleshooting

### Build fails with "Missing Supabase credentials"
This shouldn't happen anymore - the script now gracefully handles missing credentials.

If you see this error in older builds, update to the latest version of `scripts/generate-sitemap.ts`.

### Sitemap only has 9 URLs
Check that environment variables are set in Netlify:
1. Go to **Site Settings** → **Environment Variables**
2. Add both:
   - `VITE_SUPABASE_URL` = `<your-supabase-url>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `<your-supabase-anon-key>`
3. Trigger a new deploy

### How to check sitemap after deploy
Visit: `https://healthintegrityproject.org/sitemap.xml`

Look for:
- Static routes (should always be 9)
- Claim routes like `/claims/[uuid]` (should match number of claims in database)

## Post-Deployment Checklist

After your next deploy:

1. ✅ Verify sitemap exists: https://healthintegrityproject.org/sitemap.xml
2. ✅ Check robots.txt: https://healthintegrityproject.org/robots.txt
3. ✅ Submit sitemap to Google Search Console:
   - Go to https://search.google.com/search-console
   - Add property: `healthintegrityproject.org`
   - Navigate to **Sitemaps**
   - Submit: `https://healthintegrityproject.org/sitemap.xml`
4. ✅ Test meta tags on a few pages:
   - Homepage: https://healthintegrityproject.org/
   - Claims: https://healthintegrityproject.org/claims
   - Individual claim: https://healthintegrityproject.org/claims/[any-claim-id]

   Use: https://www.opengraph.xyz/ to preview how they appear on social media

## Updating the Sitemap

The sitemap regenerates automatically on every build. To trigger a new build:

1. Make any code change and push to your repository, OR
2. In Netlify: **Deploys** → **Trigger deploy** → **Deploy site**

The sitemap will update with the latest claims from your database.

## Additional Resources

- Full SEO documentation: [docs/SEO.md](./SEO.md)
- Google Search Console: https://search.google.com/search-console
- Sitemap validator: https://www.xml-sitemaps.com/validate-xml-sitemap.html
