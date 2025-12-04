/**
 * Debug Script for Single Claim
 *
 * This script queries a specific claim and shows the calculation process
 *
 * Run with: tsx scripts/debug-single-claim.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { calculateClaimStateLabel } from '../src/lib/claim-state-calculator';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CLAIM_ID = '82c543d9-5929-4ca7-a0bb-c13b776bb95c';

async function debugClaim() {
  console.log('Querying claim:', CLAIM_ID);
  console.log('='.repeat(80));

  // Query claim with publication_scores
  const { data: claim, error } = await supabase
    .from('claims')
    .select(`
      id,
      title,
      evidence_status,
      publications (
        id,
        title,
        stance,
        publication_scores (
          review_data
        )
      )
    `)
    .eq('id', CLAIM_ID)
    .single();

  if (error || !claim) {
    console.error('✗ Failed to fetch claim:', error);
    return;
  }

  console.log('✓ Successfully fetched claim');
  console.log('\nRaw data from DB:');
  console.log(JSON.stringify(claim, null, 2));
  analyzeAndCalculate(claim, 'publication_scores');
}

function analyzeAndCalculate(claim: any, scoreFieldName: string) {
  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS');
  console.log('='.repeat(80));

  console.log(`\nCurrent evidence_status in DB: ${claim.evidence_status}`);
  console.log(`\nNumber of publications: ${claim.publications?.length || 0}`);

  claim.publications?.forEach((pub: any, idx: number) => {
    console.log(`\nPublication ${idx + 1}:`);
    console.log(`  ID: ${pub.id}`);
    console.log(`  Title: ${pub.title}`);
    console.log(`  Stance: ${pub.stance}`);
    console.log(`  Reviews: ${pub[scoreFieldName]?.length || 0}`);

    pub[scoreFieldName]?.forEach((review: any, reviewIdx: number) => {
      console.log(`\n  Review ${reviewIdx + 1}:`);
      console.log(`    Category: ${review.review_data?.category}`);
      console.log(`    Study Type:`, review.review_data?.studyType);
      console.log(`    Women Not Included: ${review.review_data?.womenNotIncluded}`);
    });
  });

  // Transform data to match calculator interface
  const claimData = {
    id: claim.id,
    publications: claim.publications?.map((pub: any) => ({
      id: pub.id,
      stance: pub.stance || undefined,
      rawScores: pub[scoreFieldName] || []
    })) || []
  };

  console.log('\n' + '='.repeat(80));
  console.log('CALCULATION');
  console.log('='.repeat(80));

  const calculatedStatus = calculateClaimStateLabel(claimData);

  console.log(`\nCalculated status: ${calculatedStatus}`);
  console.log(`DB status: ${claim.evidence_status}`);
  console.log(`\nMATCH: ${calculatedStatus === claim.evidence_status ? '✓ YES' : '✗ NO'}`);

  if (calculatedStatus !== claim.evidence_status) {
    console.log('\n⚠️  MISMATCH DETECTED!');
    console.log(`Expected: ${calculatedStatus}`);
    console.log(`Got: ${claim.evidence_status}`);
  }
}

// Run the script
debugClaim()
  .then(() => {
    console.log('\n' + '='.repeat(80));
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });
