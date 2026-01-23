import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/integrations/supabase/types';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client
// Try to use service role key first (for full permissions), fall back to anon key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Required: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  console.error('Make sure your .env.local file exists and contains these variables.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function getClaimStats() {
  console.log('📊 Fetching Claims Statistics...\n');

  // Get total claims count
  const { count: totalClaims, error: totalError } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total claims:', totalError);
    return;
  }

  console.log(`🔢 Total Claims: ${totalClaims}\n`);

  // Get claims by category
  const { data: categoryData, error: categoryError } = await supabase
    .from('claims')
    .select('category');

  if (categoryError) {
    console.error('Error fetching claims by category:', categoryError);
  } else if (categoryData) {
    const categoryCounts: Record<string, number> = {};
    categoryData.forEach((claim) => {
      const cat = claim.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    console.log('📋 Claims by Category:');
    Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        const percentage = ((count / (totalClaims || 1)) * 100).toFixed(1);
        console.log(`  • ${category}: ${count} (${percentage}%)`);
      });
    console.log();
  }

  // Get claims by broad category
  const { data: broadCategoryData, error: broadCategoryError } = await supabase
    .from('claims')
    .select('broad_category');

  if (broadCategoryError) {
    console.error('Error fetching claims by broad category:', broadCategoryError);
  } else if (broadCategoryData) {
    const broadCategoryCounts: Record<string, number> = {};
    broadCategoryData.forEach((claim) => {
      const cat = claim.broad_category || 'Not Set';
      broadCategoryCounts[cat] = (broadCategoryCounts[cat] || 0) + 1;
    });

    console.log('🗂️  Claims by Broad Category:');
    Object.entries(broadCategoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        const percentage = ((count / (totalClaims || 1)) * 100).toFixed(1);
        console.log(`  • ${category}: ${count} (${percentage}%)`);
      });
    console.log();
  }

  // Get claims by evidence status
  const { data: evidenceStatusData, error: evidenceStatusError } = await supabase
    .from('claims')
    .select('evidence_status');

  if (evidenceStatusError) {
    console.error('Error fetching claims by evidence status:', evidenceStatusError);
  } else if (evidenceStatusData) {
    const evidenceStatusCounts: Record<string, number> = {};
    evidenceStatusData.forEach((claim) => {
      const status = claim.evidence_status || 'Not Set';
      evidenceStatusCounts[status] = (evidenceStatusCounts[status] || 0) + 1;
    });

    console.log('✅ Claims by Evidence Status:');
    Object.entries(evidenceStatusCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        const percentage = ((count / (totalClaims || 1)) * 100).toFixed(1);
        console.log(`  • ${status}: ${count} (${percentage}%)`);
      });
    console.log();
  }

  // Get claims by status
  const { data: statusData, error: statusError } = await supabase
    .from('claims')
    .select('status');

  if (statusError) {
    console.error('Error fetching claims by status:', statusError);
  } else if (statusData) {
    const statusCounts: Record<string, number> = {};
    statusData.forEach((claim) => {
      const status = claim.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('🚦 Claims by Status:');
    Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        const percentage = ((count / (totalClaims || 1)) * 100).toFixed(1);
        console.log(`  • ${status}: ${count} (${percentage}%)`);
      });
    console.log();
  }
}

async function getPublicationStats() {
  console.log('📚 Fetching Publication Statistics...\n');

  // Get total publications count
  const { count: totalPublications, error: totalError } = await supabase
    .from('publications')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total publications:', totalError);
    return;
  }

  console.log(`🔢 Total Publications (Papers): ${totalPublications}\n`);

  // Get unique papers evaluated (publications with scores)
  const { count: evaluatedPapers, error: evaluatedError } = await supabase
    .from('publication_scores')
    .select('publication_id', { count: 'exact', head: true });

  if (evaluatedError) {
    console.error('Error fetching evaluated papers:', evaluatedError);
  } else {
    console.log(`📝 Total Paper Evaluations: ${evaluatedPapers}\n`);
  }

  // Get unique publications that have been evaluated
  const { data: uniqueEvaluatedData, error: uniqueError } = await supabase
    .from('publication_scores')
    .select('publication_id');

  if (uniqueError) {
    console.error('Error fetching unique evaluated publications:', uniqueError);
  } else if (uniqueEvaluatedData) {
    const uniquePublications = new Set(uniqueEvaluatedData.map(p => p.publication_id));
    console.log(`📄 Unique Papers Evaluated: ${uniquePublications.size}\n`);
  }

  // Get publications by stance
  const { data: stanceData, error: stanceError } = await supabase
    .from('publications')
    .select('stance');

  if (stanceError) {
    console.error('Error fetching publications by stance:', stanceError);
  } else if (stanceData) {
    const stanceCounts: Record<string, number> = {};
    stanceData.forEach((pub) => {
      const stance = pub.stance || 'Not Set';
      stanceCounts[stance] = (stanceCounts[stance] || 0) + 1;
    });

    console.log('📊 Publications by Stance:');
    Object.entries(stanceCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([stance, count]) => {
        const percentage = ((count / (totalPublications || 1)) * 100).toFixed(1);
        console.log(`  • ${stance}: ${count} (${percentage}%)`);
      });
    console.log();
  }

  // Get publications by status
  const { data: pubStatusData, error: pubStatusError } = await supabase
    .from('publications')
    .select('status');

  if (pubStatusError) {
    console.error('Error fetching publications by status:', pubStatusError);
  } else if (pubStatusData) {
    const statusCounts: Record<string, number> = {};
    pubStatusData.forEach((pub) => {
      const status = pub.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('🚦 Publications by Status:');
    Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        const percentage = ((count / (totalPublications || 1)) * 100).toFixed(1);
        console.log(`  • ${status}: ${count} (${percentage}%)`);
      });
    console.log();
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Evidence Decoded - Claims & Publications Statistics');
  console.log('═══════════════════════════════════════════════════════\n');

  await getClaimStats();
  console.log('───────────────────────────────────────────────────────\n');
  await getPublicationStats();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Statistics Report Complete');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
