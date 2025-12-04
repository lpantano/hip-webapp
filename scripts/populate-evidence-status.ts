/**
 * One-Time Population Script for Evidence Status
 *
 * This script:
 * 1. Fetches all claims with their publications and expert reviews
 * 2. Calculates the evidence status for each claim
 * 3. Updates the evidence_status column in the database
 *
 * Run with: tsx scripts/populate-evidence-status.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { calculateClaimStateLabel } from '../src/lib/claim-state-calculator';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client with service role key to bypass RLS
// Note: In production, these would come from environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Make sure your .env.local file exists and contains these variables.');
  console.error('Note: This script requires the service role key to bypass RLS policies.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateEvidenceStatus() {
  console.log('Starting evidence status population...\n');

  // Fetch all claims with nested publications and reviews
  const { data: claims, error } = await supabase
    .from('claims')
    .select(`
      id,
      title,
      publications (
        id,
        stance,
        publication_scores (
          review_data
        )
      )
    `);

  if (error) {
    console.error('Error fetching claims:', error);
    return;
  }

  if (!claims || claims.length === 0) {
    console.log('No claims found in database.');
    return;
  }

  console.log(`Processing ${claims.length} claims...\n`);

  // Track statistics
  let successCount = 0;
  let errorCount = 0;
  const statusCounts: Record<string, number> = {
    'Awaiting Evidence': 0,
    'Evidence Supports': 0,
    'Evidence Disproves': 0,
    'Inconclusive': 0
  };

  // Process each claim
  for (const claim of claims) {
    try {
      // Transform data to match calculator interface
      const claimData = {
        id: claim.id,
        publications: claim.publications?.map((pub: { id: string; stance: string; publication_scores: unknown[] }) => ({
          id: pub.id,
          stance: pub.stance,
          rawScores: pub.publication_scores || []
        })) || []
      };

      // Calculate evidence status
      const evidenceStatus = calculateClaimStateLabel(claimData);

      // Update the database
      const { error: updateError } = await supabase
        .from('claims')
        .update({ evidence_status: evidenceStatus })
        .eq('id', claim.id);

      if (updateError) throw updateError;

      // Track success
      console.log(`✓ [${claim.id.substring(0, 8)}...] ${claim.title?.substring(0, 50) || 'Untitled'}: ${evidenceStatus}`);
      successCount++;
      statusCounts[evidenceStatus]++;

    } catch (err) {
      console.error(`✗ Failed to update claim ${claim.id}:`, err);
      errorCount++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total claims processed: ${claims.length}`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Failed updates: ${errorCount}`);
  console.log('\nStatus Distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    const percentage = ((count / successCount) * 100).toFixed(1);
    console.log(`  ${status}: ${count} (${percentage}%)`);
  });
  console.log('='.repeat(60));
}

// Run the script
populateEvidenceStatus()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });
