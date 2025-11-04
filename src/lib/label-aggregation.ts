import { getClassificationReasons } from '@/types/review';
import { CLASSIFICATION_CATEGORIES, isProblematicCategory } from './classification-categories';

export type LabelAggregation = {
  classificationOrder: string[];
  supportingLabelCounts: Record<string, number>;
  contradictingLabelCounts: Record<string, number>;
  supportingWomenNotIncluded: number;
  contradictingWomenNotIncluded: number;
  // aggregatedReasons[stance][label] => array of formatted reason strings (with counts)
  aggregatedReasons: {
    supporting: Record<string, string[]>;
    contradicting: Record<string, string[]>;
  };
};

export type PublicationAggregation = {
  classificationCounts: Record<string, number>;
  womenNotIncludedCount: number;
};

/**
 * Aggregate minimal review tags for a single publication: only classification
 * counts and womenNotIncluded counts (keeps function small and fast).
 */
export function aggregatePublicationReviewData(
  publication: { rawScores?: Array<{ review_data?: unknown | null }> }
): PublicationAggregation {
  const classificationCounts: Record<string, number> = {};
  let womenNotIncludedCount = 0;

  (publication.rawScores || []).forEach((row) => {
    const rd = (row && (row as { review_data?: unknown }).review_data) as Record<string, unknown> | undefined | null;
    if (!rd) return;

  const rdObj = rd as Record<string, unknown>;
  const maybeLabel = typeof rdObj['category'] === 'string' ? String(rdObj['category']) : undefined;
  if (maybeLabel) classificationCounts[maybeLabel] = (classificationCounts[maybeLabel] || 0) + 1;

  if (rdObj['womenNotIncluded'] === true) womenNotIncludedCount++;
  });

  return { classificationCounts, womenNotIncludedCount };
}

/**
 * Aggregate publication labels and classification reasons for a claim.
 *
 * This function extracts the counting and reason-aggregation logic so the
 * rendering code can be changed without touching the aggregation.
 */
type PublicationMinimal = {
  stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
  rawScores?: Array<{
    review_data?: unknown | null;
    // other fields intentionally omitted
  }>;
};

type ClaimMinimal = {
  publications: PublicationMinimal[];
};

export function aggregateLabelsForClaim(claim: ClaimMinimal): LabelAggregation {
  const classificationOrder = [...CLASSIFICATION_CATEGORIES];

  const supportingLabelCounts: Record<string, number> = {};
  const contradictingLabelCounts: Record<string, number> = {};
  let supportingWomenNotIncluded = 0;
  let contradictingWomenNotIncluded = 0;

  // For reasons, collect raw reasons then collapse to counts per label+stance
  const supportingReasonsRaw: Record<string, string[]> = {};
  const contradictingReasonsRaw: Record<string, string[]> = {};

  claim.publications.forEach((pub: PublicationMinimal) => {
    (pub.rawScores || []).forEach((score) => {
      const rd = score.review_data as Record<string, unknown> | undefined;
      type ReviewDataLike = { womenNotIncluded?: boolean; category?: string };
      const rdl = rd as ReviewDataLike | undefined;
      const label = rdl?.category as string | undefined;
      if (label) {
        if (pub.stance === 'supporting') {
          supportingLabelCounts[label] = (supportingLabelCounts[label] || 0) + 1;
        } else if (pub.stance === 'contradicting') {
          contradictingLabelCounts[label] = (contradictingLabelCounts[label] || 0) + 1;
        }
      }
      if (rdl?.womenNotIncluded) {
        if (pub.stance === 'supporting') supportingWomenNotIncluded++;
        else if (pub.stance === 'contradicting') contradictingWomenNotIncluded++;
      }

      // collect reasons for the three classification types
      if (label && isProblematicCategory(label)) {
        const reasons = getClassificationReasons(rdl);
        if (reasons && reasons.length > 0) {
          const target = pub.stance === 'supporting' ? supportingReasonsRaw : contradictingReasonsRaw;
          if (!target[label]) target[label] = [];
          target[label].push(...reasons);
        }
      }
    });
  });

  const collapseReasons = (raw: Record<string, string[]>) => {
    const out: Record<string, string[]> = {};
    Object.entries(raw).forEach(([label, arr]) => {
      const counts: Record<string, number> = {};
      arr.forEach((r) => { counts[r] = (counts[r] || 0) + 1; });
      out[label] = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([reason, count]) => (count > 1 ? `${reason} (${count})` : reason));
    });
    return out;
  };

  return {
    classificationOrder,
    supportingLabelCounts,
    contradictingLabelCounts,
    supportingWomenNotIncluded,
    contradictingWomenNotIncluded,
    aggregatedReasons: {
      supporting: collapseReasons(supportingReasonsRaw),
      contradicting: collapseReasons(contradictingReasonsRaw)
    }
  };
}
