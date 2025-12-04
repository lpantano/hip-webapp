/**
 * Query actual claim data from database
 *
 * Usage in browser console:
 * 1. Copy this entire script
 * 2. Paste in browser DevTools console
 * 3. It will log the full claim structure
 */

import { supabase } from '../src/integrations/supabase/client';

const CLAIM_ID = '82c543d9-5929-4ca7-a0bb-c13b776bb95c';

async function queryClaimData() {
  console.log('Querying claim:', CLAIM_ID);

  // Query the claim with all related publications and reviews
  const { data: claim, error } = await supabase
    .from('claims')
    .select(`
      id,
      claim_text,
      claim_publications!inner(
        publication:publications!inner(
          id,
          title,
          stance,
          publication_reviews(
            id,
            review_data,
            created_at
          )
        )
      )
    `)
    .eq('id', CLAIM_ID)
    .single();

  if (error) {
    console.error('Error querying claim:', error);
    return;
  }

  console.log('Raw claim data from DB:', JSON.stringify(claim, null, 2));

  // Transform to match calculator format
  const publications = claim.claim_publications?.map((cp: any) => ({
    id: cp.publication.id,
    title: cp.publication.title,
    stance: cp.publication.stance,
    rawScores: cp.publication.publication_reviews || []
  }));

  console.log('\nTransformed publications:', JSON.stringify(publications, null, 2));

  // Test with calculator
  const { calculateClaimStateLabel } = await import('../src/lib/claim-state-calculator');
  const result = calculateClaimStateLabel({
    id: claim.id,
    publications
  });

  console.log('\nCalculated state:', result);
  console.log('Expected: Evidence Supports');
}

queryClaimData();
