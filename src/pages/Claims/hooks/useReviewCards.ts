import { useMemo } from 'react';
import type { ExpertReviewCard } from '../components/ExpertReviewsReel';
import type { ClaimUI, PublicationScoreRow } from '../types';

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

/**
 * Custom hook to generate expert review cards from claim data
 */
export const useReviewCards = (
  claim: ClaimUI | undefined,
  expertProfiles: Record<string, ExpertProfile>
): ExpertReviewCard[] => {
  return useMemo(() => {
    if (!claim) return [];

    const reviewCards: ExpertReviewCard[] = [];

    claim.publications.forEach(pub => {
      // The stance comes from the publication itself
      const publicationStance = pub.stance as 'supporting' | 'contradicting' | null;

      // Group scores by expert
      const scoresByExpert: Record<string, PublicationScoreRow[]> = {};
      (pub.rawScores || []).forEach(score => {
        if (!scoresByExpert[score.expert_user_id]) {
          scoresByExpert[score.expert_user_id] = [];
        }
        scoresByExpert[score.expert_user_id].push(score);
      });

      // Get comments for this claim
      const claimCommentsForClaim = claim.comments || [];

      // Create individual cards for each expert who reviewed this publication
      Object.entries(scoresByExpert).forEach(([expertUserId, scores]) => {
        const expertProfile = expertProfiles[expertUserId];
        const expertComments = claimCommentsForClaim.filter(
          comment => comment.expert_user_id === expertUserId
        );

        // For consolidated schema, pick the latest row for this expert (there should be one)
        const latestRow = (scores || []).reduce((a, b) => {
          const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
          const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
          return bTime >= aTime ? b : a;
        }, scores[0]);

        // Build quality check scores
        const expertScores: Array<{ category: string; score?: 'PASS' | 'NO' | 'NA' | null }> = [
          { category: 'studyDesign', score: latestRow?.review_data?.qualityChecks?.studyDesign ?? null },
          { category: 'statistics', score: latestRow?.review_data?.qualityChecks?.statistics ?? null },
          { category: 'controlGroup', score: latestRow?.review_data?.qualityChecks?.controlGroup ?? null },
          { category: 'biasAddressed', score: latestRow?.review_data?.qualityChecks?.biasAddressed ?? null }
        ];

        // Merge comments: claim-level expert comments + the review's comments (if present)
        const mergedComments = [
          ...expertComments.map(c => ({ content: c.content, created_at: c.created_at })),
        ];
        if (latestRow?.comments) {
          mergedComments.push({
            content: latestRow.comments,
            created_at: latestRow.updated_at || latestRow.created_at || ''
          });
        }

        reviewCards.push({
          publication: {
            id: pub.id,
            title: pub.title,
            journal: pub.journal,
            year: pub.year,
            authors: pub.authors,
            source: pub.source || null
          },
          expert: {
            expert_user_id: expertUserId,
            display_name: expertProfile?.display_name,
            avatar_url: expertProfile?.avatar_url,
            scores: expertScores,
            comments: mergedComments,
            classification: latestRow?.review_data?.category ?? null,
            tags: latestRow?.review_data?.tags ?? null,
            womenNotIncluded: latestRow?.review_data?.womenNotIncluded ?? false,
            reviewData: latestRow?.review_data ?? null,
            stance: publicationStance
          }
        });
      });
    });

    return reviewCards;
  }, [claim, expertProfiles]);
};
