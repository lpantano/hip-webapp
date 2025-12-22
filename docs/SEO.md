# SEO Implementation Guide

This document describes the SEO implementation for Evidence Decoded (Health Integrity Project).

## Overview

The application now includes comprehensive SEO optimization for better Google indexing and search visibility:

1. **Dynamic Meta Tags** - Page-specific titles, descriptions, and Open Graph tags
2. **Sitemap Generation** - Automated sitemap with all static and dynamic pages
3. **Robots.txt** - Configured to allow all crawlers with sitemap reference
4. **Structured Data** - Schema.org markup ready for implementation

## Dynamic Meta Tags

### SEO Component

Location: [src/components/SEO.tsx](../src/components/SEO.tsx)

The `SEO` component uses `react-helmet-async` to manage dynamic meta tags. It supports:

- Page titles with site name
- Meta descriptions
- Keywords
- Canonical URLs
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Article-specific metadata (for claim detail pages)

### Usage

```tsx
import { SEO } from '@/components/SEO';

function MyPage() {
  return (
    <div>
      <SEO
        title="Page Title"
        description="Page description"
        url="/page-path"
        keywords="keyword1, keyword2"
      />
      {/* Page content */}
    </div>
  );
}
```

### Pages with SEO Tags

- ✅ [Index](../src/pages/Index.tsx) - Homepage
- ✅ [Claims](../src/pages/Claims/index.tsx) - Claims listing
- ✅ [ClaimDetail](../src/pages/ClaimDetail.tsx) - Individual claim pages (dynamic)
- ✅ [About](../src/pages/About.tsx) - About page
- ✅ [ResearchWorkflow](../src/pages/ResearchWorkflow.tsx) - Research workflow page

### Adding SEO to New Pages

1. Import the SEO component:
   ```tsx
   import { SEO } from '@/components/SEO';
   ```

2. Add the component at the top of your page:
   ```tsx
   <SEO
     title="Your Page Title"
     description="Your page description"
     url="/your-page-path"
     keywords="relevant, keywords, here"
   />
   ```

## Sitemap Generation

### Script

Location: [scripts/generate-sitemap.ts](../scripts/generate-sitemap.ts)

The sitemap generation script:
- Includes all static routes with appropriate priorities
- Fetches all claims from Supabase for dynamic routes (if credentials available)
- Generates XML sitemap in [public/sitemap.xml](../public/sitemap.xml)
- Runs automatically during build process
- **Gracefully handles missing credentials** - will generate static-only sitemap if Supabase is unavailable

### Running Manually

```bash
npm run generate:sitemap
```

### Build Process

The sitemap is automatically generated during production builds:

```bash
npm run build
```

This runs `generate:sitemap` before the Vite build process.

### Netlify Configuration

The script requires Supabase environment variables to include dynamic claim pages. In your Netlify dashboard:

1. Go to **Site Settings** → **Environment Variables**
2. Ensure these variables are set (they should already exist for your app):
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

**Note:** If these variables are not set, the build will still succeed but only static routes will be included in the sitemap. Dynamic claim pages will be added once the environment variables are configured.

### Configuration

Edit [scripts/generate-sitemap.ts](../scripts/generate-sitemap.ts) to:
- Add new static routes to `staticRoutes` array
- Adjust priorities (0.0 to 1.0)
- Modify change frequencies (daily, weekly, monthly, yearly)
- Update the site URL

## Robots.txt

Location: [public/robots.txt](../public/robots.txt)

Configured to:
- Allow all search engine crawlers
- Reference the sitemap location
- Support major bots (Googlebot, Bingbot, Twitter, Facebook)

## What's Next (Optional Improvements)

### Priority 1 - Pre-rendering for Better Crawling

SPAs (Single Page Apps) can be difficult for search engines to crawl. Consider:

1. **Vite SSG Plugin** - Pre-render static pages at build time
   ```bash
   npm install -D vite-ssg
   ```

2. **Prerender.io** - Service that renders your SPA for crawlers
   - Sign up at https://prerender.io
   - Add to hosting platform

3. **Framework Migration** - Consider Next.js or Remix for SSR if SEO becomes critical

### Priority 2 - Structured Data (Schema.org)

Add JSON-LD structured data for:
- Scientific articles (claims with publications)
- Organization information
- Review ratings
- Breadcrumbs

Example for claim pages:
```tsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Claim Title",
  "description": "Claim description",
  "reviewedBy": {
    "@type": "Organization",
    "name": "Health Integrity Project"
  }
}
</script>
```

### Priority 3 - Google Search Console

1. Visit https://search.google.com/search-console
2. Add your domain: `healthintegrityproject.org`
3. Verify ownership (DNS or HTML file method)
4. Submit sitemap: `https://healthintegrityproject.org/sitemap.xml`
5. Monitor indexing status and search performance

### Priority 4 - Performance Optimization

Google prioritizes fast sites. Focus on:
- **Core Web Vitals** - Monitor LCP, FID, CLS
- **Image Optimization** - Use WebP format, lazy loading
- **Code Splitting** - Already implemented with React.lazy()
- **CDN** - Ensure assets are served from CDN

### Priority 5 - Content Optimization

- Ensure unique, descriptive titles for each claim
- Add alt text to all images
- Use semantic HTML (proper heading hierarchy)
- Internal linking between related claims
- Regular content updates

## Testing

### Validate Sitemap

1. Check sitemap syntax: https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. Paste: `https://healthintegrityproject.org/sitemap.xml`

### Test Meta Tags

1. Use Facebook's Open Graph debugger: https://developers.facebook.com/tools/debug/
2. Use Twitter Card validator: https://cards-dev.twitter.com/validator
3. Use Google's Rich Results Test: https://search.google.com/test/rich-results

### Check Mobile Friendliness

Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

### Page Speed

- https://pagespeed.web.dev/
- Enter URL and check both mobile and desktop scores

## Monitoring

After deploying:

1. **Google Search Console** - Track indexing and search performance
2. **Google Analytics** - Monitor organic traffic
3. **Sitemap Updates** - Regenerate sitemap when adding new pages or claims

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Health Documentation](https://schema.org/docs/meddocs.html)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
