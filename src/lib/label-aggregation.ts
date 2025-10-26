import { getClassificationReasons, ReviewData } from '@/types/review';

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
  const classificationOrder = [
    'Invalid',
    'Fallacy',
    'Unreliable',
    'Not Tested in Humans',
    'Limited Tested in Humans',
    'Tested in Humans',
    'Widely Tested in Humans'
  ];

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
      if (label && (label === 'Invalid' || label === 'Unreliable' || label === 'Fallacy')) {
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
