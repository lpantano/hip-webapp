/**
 * Claim State Calculator
 *
 * Calculates evidence-based state labels for claims based on:
 * - Publication stance (supporting/contradicting)
 * - Expert review classifications
 * - Study type (clinical trial vs observational)
 * - Sample size
 * - Women inclusion
 */

export type ClaimStateLabel =
  | 'Awaiting Evidence'
  | 'Evidence Supports'
  | 'Evidence Disproves'
  | 'Inconclusive';

interface ReviewData {
  category?: string;
  studyType?: {
    observational?: boolean;
    clinicalTrial?: boolean;
  };
  womenNotIncluded?: boolean;
}

interface PublicationScore {
  review_data: ReviewData;
}

interface Publication {
  id: string;
  stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed';
  rawScores?: PublicationScore[];
}

interface ClaimData {
  id: string;
  publications?: Publication[];
}

// Study type multipliers
const STUDY_TYPE_MULTIPLIERS = {
  clinicalTrial: 1.0,  // Full weight
  observational: 0.7,  // 70% weight
  neither: 0.1         // Minimal weight (10%)
};

// Sample size base scores (from classification category)
const SAMPLE_SIZE_SCORES: Record<string, number> = {
  'Widely Tested in Humans': 10,      // >500k participants
  'Tested in Humans': 8,              // 100-500k participants
  'Limited Tested in Humans': 6,      // <100 participants
  'Not Tested in Humans': 1,          // Animal/cell studies
  'Inconclusive': 0,                  // Quality issues
  'Invalid': 0,                       // Fundamental problems
  'Misinformation': -1               // Track separately
};

// 2x threshold for directional labels
const CONFIDENCE_THRESHOLD_MULTIPLIER = 2;

/**
 * Score a single publication based on its expert reviews
 * Returns the highest score from all reviews (most favorable assessment)
 */
function scorePublication(publication: Publication): number {
  if (!publication.rawScores || publication.rawScores.length === 0) {
    return 0; // No reviews yet
  }

  // Get best score from all reviews for this publication
  const scores = publication.rawScores.map(review => {
    const reviewData = review.review_data;

    // Disqualify if women not included
    if (reviewData.womenNotIncluded === true) {
      return 0;
    }

    // Get base score from classification category
    const category = reviewData.category || '';
    const baseScore = SAMPLE_SIZE_SCORES[category];

    // Handle undefined category or invalid/inconclusive/misinformation
    if (baseScore === undefined) {
      return 0;
    }

    if (baseScore <= 0) {
      return baseScore; // Return -1 for misinformation, 0 for invalid/inconclusive
    }

    // Determine study type multiplier
    const studyType = reviewData.studyType;
    let multiplier = STUDY_TYPE_MULTIPLIERS.neither;

    if (studyType?.clinicalTrial) {
      multiplier = STUDY_TYPE_MULTIPLIERS.clinicalTrial;
    } else if (studyType?.observational) {
      multiplier = STUDY_TYPE_MULTIPLIERS.observational;
    }

    return Math.round(baseScore * multiplier);
  });

  // Return the highest score (most favorable review)
  // Note: Can return -1 for misinformation
  return Math.max(...scores);
}

/**
 * Calculate the evidence-based state label for a claim
 *
 * Algorithm:
 * 1. Check if evidence exists
 * 2. Check if expert reviews exist
 * 3. Score each publication by quality
 * 4. Handle misinformation
 * 5. Aggregate by stance
 * 6. Apply 2x threshold to determine label
 */
export function calculateClaimStateLabel(claim: ClaimData): ClaimStateLabel {
  // Step 1: Check if evidence exists
  if (!claim.publications || claim.publications.length === 0) {
    return 'Awaiting Evidence';
  }

  // Step 2: Separate publications by stance
  const supportingPubs = claim.publications.filter(p => p.stance === 'supporting');
  const contradictingPubs = claim.publications.filter(p => p.stance === 'contradicting');

  // Step 3: Check if any reviews exist
  const hasReviews = claim.publications.some(p =>
    p.rawScores && p.rawScores.length > 0
  );

  if (!hasReviews) {
    return 'Awaiting Evidence';
  }

  // Step 4: Score all publications and detect misinformation
  const supportingScores = supportingPubs.map(scorePublication);
  const contradictingScores = contradictingPubs.map(scorePublication);

  // Check for misinformation in supporting evidence
  const supportingMisinformation = supportingScores.some(s => s === -1);
  const bestSupportingScore = Math.max(...supportingScores.filter(s => s >= 0), 0);

  // Step 5: Handle misinformation
  if (supportingPubs.length > 0 && supportingMisinformation && bestSupportingScore === 0) {
    // Only supporting evidence is misinformation (no valid supporting evidence)
    return 'Evidence Disproves';
  }

  // Step 6: Calculate totals (excluding misinformation papers with score -1)
  const supportingTotal = supportingScores
    .filter(s => s >= 0)
    .reduce((sum, s) => sum + s, 0);

  const contradictingTotal = contradictingScores
    .filter(s => s >= 0)
    .reduce((sum, s) => sum + s, 0);

  // Step 7: Apply 2x threshold to determine final label
  if (supportingTotal >= CONFIDENCE_THRESHOLD_MULTIPLIER * contradictingTotal && supportingTotal > 0) {
    return 'Evidence Supports';
  }

  if (contradictingTotal >= CONFIDENCE_THRESHOLD_MULTIPLIER * supportingTotal && contradictingTotal > 0) {
    return 'Evidence Disproves';
  }

  return 'Inconclusive';
}
