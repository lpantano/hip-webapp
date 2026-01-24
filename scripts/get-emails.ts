import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client with service role key (required for auth.users access)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Note: Service role key is required to access auth.users table');
  console.error('Make sure your .env.local file exists and contains these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Invalid email domain patterns to filter out
const INVALID_DOMAINS = [
  'gmxxail.com', // typo for gmail.com
  'slclogin.com', // suspicious domain
];

function isValidEmail(email: string): boolean {
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Check against invalid domains
  const domain = email.split('@')[1]?.toLowerCase();
  if (INVALID_DOMAINS.some((invalid) => domain === invalid)) {
    return false;
  }

  return true;
}

async function getEmails() {
  console.log('📧 Fetching all emails...\n');

  // Get emails from auth.users (registered users)
  console.log('--- Registered Users (auth.users) ---');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching auth users:', authError.message);
  } else if (authUsers?.users) {
    const userEmails = authUsers.users
      .map((u) => u.email)
      .filter((email): email is string => !!email)
      .sort();

    console.log(`Found ${userEmails.length} registered users:\n`);
    userEmails.forEach((email) => console.log(email));
  }

  // Get emails from mailing_list_signups
  console.log('\n--- Mailing List Signups ---');
  const { data: mailingList, error: mailingError } = await supabase
    .from('mailing_list_signups')
    .select('email, created_at')
    .order('created_at', { ascending: true });

  if (mailingError) {
    console.error('Error fetching mailing list:', mailingError.message);
  } else if (mailingList) {
    console.log(`Found ${mailingList.length} mailing list signups:\n`);
    mailingList.forEach((entry) => console.log(entry.email));
  }

  // Get combined unique emails
  const allEmails = new Set<string>();
  const invalidEmails: string[] = [];

  if (authUsers?.users) {
    authUsers.users.forEach((u) => {
      if (u.email) {
        const email = u.email.toLowerCase();
        if (isValidEmail(email)) {
          allEmails.add(email);
        } else {
          invalidEmails.push(email);
        }
      }
    });
  }

  if (mailingList) {
    mailingList.forEach((entry) => {
      if (entry.email) {
        const email = entry.email.toLowerCase();
        if (isValidEmail(email)) {
          allEmails.add(email);
        } else {
          invalidEmails.push(email);
        }
      }
    });
  }

  const sortedEmails = Array.from(allEmails).sort();

  // Show filtered emails
  if (invalidEmails.length > 0) {
    console.log('\n--- Filtered Out (Invalid Emails) ---');
    [...new Set(invalidEmails)].forEach((email) => console.log(`❌ ${email}`));
  }

  console.log('\n--- All Unique Valid Emails (Combined) ---');
  console.log(`Total unique valid emails: ${sortedEmails.length}\n`);
  sortedEmails.forEach((email) => console.log(email));

  // Save to file
  const outputPath = join(process.cwd(), 'company', 'emails', 'email-list.txt');
  writeFileSync(outputPath, sortedEmails.join('\n') + '\n');
  console.log(`\n✅ Saved ${sortedEmails.length} emails to ${outputPath}`);

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Registered users: ${authUsers?.users?.length || 0}`);
  console.log(`Mailing list signups: ${mailingList?.length || 0}`);
  console.log(`Invalid emails filtered: ${invalidEmails.length}`);
  console.log(`Total unique valid emails: ${sortedEmails.length}`);
}

getEmails().catch(console.error);
