import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const buttondownApiKey = process.env.BUTTONDOWN_API_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!buttondownApiKey) {
  console.error('Error: Missing BUTTONDOWN_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUTTONDOWN_API = 'https://api.buttondown.email/v1';

const INVALID_DOMAINS = ['gmxxail.com', 'slclogin.com'];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return !INVALID_DOMAINS.some((invalid) => domain === invalid);
}

async function buttondownRequest(method: string, path: string, body?: object): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BUTTONDOWN_API}${path}`, {
    method,
    headers: {
      Authorization: `Token ${buttondownApiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) {
    const err = new Error(`Buttondown ${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`) as Error & { status: number; body: unknown };
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return { status: res.status, data };
}

async function getButtondownSubscribers(): Promise<Set<string>> {
  const emails = new Set<string>();
  let cursor: string | null = null;

  do {
    const url = cursor
      ? `/subscribers?cursor=${encodeURIComponent(cursor)}`
      : '/subscribers';
    const { data } = await buttondownRequest('GET', url);
    const page = data as { results?: { email_address?: string }[]; next?: string };
    for (const sub of page.results ?? []) {
      if (sub.email_address) emails.add(sub.email_address.toLowerCase());
    }
    cursor = page.next ? new URL(page.next).searchParams.get('cursor') : null;
  } while (cursor);

  return emails;
}

async function getSupabaseEmails(): Promise<{ email: string; name: string | null }[]> {
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(`Failed to fetch auth users: ${error.message}`);

  const userMap = new Map<string, string | null>();
  for (const u of authUsers?.users ?? []) {
    if (u.id) userMap.set(u.id, u.email ?? null);
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, display_name');
  if (profileError) throw new Error(`Failed to fetch profiles: ${profileError.message}`);

  const results: { email: string; name: string | null }[] = [];
  for (const profile of profiles ?? []) {
    const email = userMap.get(profile.user_id);
    if (email && isValidEmail(email.toLowerCase())) {
      results.push({ email: email.toLowerCase(), name: profile.display_name ?? null });
    }
  }

  // Also include auth users without a profile
  for (const u of authUsers?.users ?? []) {
    if (!u.email) continue;
    const email = u.email.toLowerCase();
    if (!isValidEmail(email)) continue;
    const alreadyIncluded = results.some((r) => r.email === email);
    if (!alreadyIncluded) {
      results.push({ email, name: null });
    }
  }

  return results;
}

async function syncToButtondown() {
  console.log('🔄 Syncing users to Buttondown...\n');

  console.log('📥 Fetching existing Buttondown subscribers...');
  const existing = await getButtondownSubscribers();
  console.log(`   Found ${existing.size} existing subscribers\n`);

  console.log('📋 Fetching Supabase users...');
  const users = await getSupabaseEmails();
  console.log(`   Found ${users.length} valid users\n`);

  const toAdd = users.filter((u) => !existing.has(u.email));
  const alreadySynced = users.filter((u) => existing.has(u.email));

  console.log(`✅ Already subscribed: ${alreadySynced.length}`);
  console.log(`➕ To be added: ${toAdd.length}\n`);

  if (toAdd.length === 0) {
    console.log('Nothing to sync. All users are already subscribed.');
    return;
  }

  let added = 0;
  let failed = 0;

  for (const user of toAdd) {
    try {
      await buttondownRequest('POST', '/subscribers', {
        email_address: user.email,
        ...(user.name ? { metadata: { name: user.name } } : {}),
        type: 'regular',
      });
      console.log(`  ✓ Added: ${user.email}`);
      added++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Buttondown returns 400 for already-subscribed with a specific message
      if (message.includes('already')) {
        console.log(`  ~ Skipped (already exists): ${user.email}`);
      } else {
        console.error(`  ✗ Failed: ${user.email} — ${message}`);
        failed++;
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total Supabase users: ${users.length}`);
  console.log(`Already subscribed:   ${alreadySynced.length}`);
  console.log(`Newly added:          ${added}`);
  if (failed > 0) console.log(`Failed:               ${failed}`);
  console.log('\n✅ Sync complete.');
}

syncToButtondown().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
