import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const SITE_URL = 'https://healthintegrityproject.org';

// Static routes with their priorities and change frequencies
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/team', priority: 0.7, changefreq: 'monthly' },
  { path: '/community', priority: 0.7, changefreq: 'weekly' },
  { path: '/claims', priority: 0.9, changefreq: 'daily' },
  { path: '/legal', priority: 0.5, changefreq: 'yearly' },
  { path: '/roadmap', priority: 0.6, changefreq: 'monthly' },
  { path: '/features', priority: 0.6, changefreq: 'monthly' },
  { path: '/workflow', priority: 0.8, changefreq: 'monthly' },
];

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  priority: number;
  changefreq: string;
}

async function generateSitemap() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const entries: SitemapEntry[] = [];

  // Add static routes
  staticRoutes.forEach(route => {
    entries.push({
      loc: `${SITE_URL}${route.path}`,
      priority: route.priority,
      changefreq: route.changefreq,
    });
  });

  // Fetch all claims for dynamic routes (if credentials available)
  if (supabaseUrl && supabaseAnonKey) {
    console.log('Fetching claims from Supabase...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      const { data: claims, error } = await supabase
        .from('claims')
        .select('id, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('Error fetching claims:', error.message);
        console.log('Continuing with static routes only...');
      } else if (claims) {
        claims.forEach(claim => {
          const lastmod = claim.updated_at || claim.created_at;
          entries.push({
            loc: `${SITE_URL}/claims/${claim.id}`,
            lastmod: new Date(lastmod).toISOString().split('T')[0],
            priority: 0.7,
            changefreq: 'weekly',
          });
        });
        console.log(`✓ Added ${claims.length} claim pages to sitemap`);
      }
    } catch (err) {
      console.warn('Failed to fetch claims:', err);
      console.log('Continuing with static routes only...');
    }
  } else {
    console.warn('⚠️  Supabase credentials not found in environment variables.');
    console.log('Generating sitemap with static routes only.');
    console.log('To include dynamic claim pages, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  // Generate XML
  const xml = generateSitemapXML(entries);

  // Write to public directory
  const publicDir = join(process.cwd(), 'public');
  const sitemapPath = join(publicDir, 'sitemap.xml');

  writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
  console.log(`Total URLs: ${entries.length}`);
}

function generateSitemapXML(entries: SitemapEntry[]): string {
  const urlEntries = entries
    .map(entry => {
      const lastmodTag = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : '';
      return `  <url>
    <loc>${entry.loc}</loc>${lastmodTag}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Run the generator
generateSitemap().catch(err => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
