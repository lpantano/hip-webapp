import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ClaimUI, ClaimRow, PublicationRow, ClaimCommentRow, ClaimLinkRow, PublicationScoreRow } from '../types';
import { groupBy } from '../utils/helpers';

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

interface UseClaimDataResult {
  claim: ClaimUI | null;
  expertProfiles: Record<string, ExpertProfile>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch a single claim by ID with all related data
 */
export const useClaimData = (claimId: string | null): UseClaimDataResult => {
  const [claim, setClaim] = useState<ClaimUI | null>(null);
  const [expertProfiles, setExpertProfiles] = useState<Record<string, ExpertProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClaim = useCallback(async () => {
    if (!claimId) {
      setLoading(false);
      setError(new Error('No claim ID provided'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the claim by ID using .maybeSingle() (returns null if not found, doesn't throw)
      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .maybeSingle();

      if (claimError) throw claimError;

      if (!claimData) {
        throw new Error('Claim not found');
      }

      // Batch the claim-dependent queries in parallel
      const [
        { data: publicationsData, error: publicationsError },
        { data: commentsData, error: commentsError },
        { data: linksData, error: linksError }
      ] = await Promise.all([
        supabase.from('publications').select('*').eq('claim_id', claimId),
        supabase.from('claim_comments').select('*').eq('claim_id', claimId).order('created_at', { ascending: true }),
        supabase.from('claim_links').select('*').eq('claim_id', claimId)
      ]);

      if (publicationsError) throw publicationsError;
      if (commentsError) throw commentsError;
      if (linksError) throw linksError;

      // Map publications for this claim
      const pubs = (publicationsData || []).map((p: PublicationRow) => ({
        id: p.id,
        title: p.title,
        authors: p.authors || '',
        journal: p.journal || '',
        year: p.publication_year || (p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear()),
        url: p.url || p.doi || '',
        source: p.source || null,
        stance: p.stance,
        rawScores: []
      }));

      // Map claim to ClaimUI format
      const mappedClaim: ClaimUI = {
        id: claimData.id,
        claim: claimData.title || claimData.description || '',
        user_id: claimData.user_id,
        category: claimData.category,
        broad_category: claimData.broad_category,
        votes: claimData.vote_count || 0,
        created_at: claimData.created_at,
        publications: pubs,
        links: (linksData || []).map((l: ClaimLinkRow) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          description: l.description,
          link_type: l.link_type,
          expert_user_id: l.expert_user_id
        })),
        comments: commentsData || [],
        rawStatus: claimData.status,
        status: claimData.status as ClaimUI['status'],
        evidence_status: 'evidence_status' in claimData ? (claimData.evidence_status as ClaimUI['evidence_status']) : null
      };

      // Fetch publication scores and expert profiles
      const pubIds = pubs.map(p => p.id);
      if (pubIds.length > 0) {
        const { data: scoreRows, error: scoreErr } = await supabase
          .from('publication_scores')
          .select('*')
          .in('publication_id', pubIds);

        if (!scoreErr && scoreRows) {
          const scoreRowsTyped = scoreRows as PublicationScoreRow[];
          const scoreMap: Record<string, PublicationScoreRow[]> = {};
          const expertIdsSet = new Set<string>();

          // Build score map and collect expert IDs
          scoreRowsTyped.forEach((r) => {
            if (!scoreMap[r.publication_id]) scoreMap[r.publication_id] = [];
            scoreMap[r.publication_id].push(r);
            if (r.expert_user_id) expertIdsSet.add(r.expert_user_id);
          });

          // Fetch expert profiles
          const expertIds = Array.from(expertIdsSet);
          if (expertIds.length > 0) {
            const { data: statsRows, error: statsErr } = await supabase
              .from('expert_stats')
              .select('user_id, display_name, avatar_url')
              .in('user_id', expertIds);

            if (!statsErr && statsRows) {
              const statsMap: Record<string, ExpertProfile> = {};
              statsRows.forEach((r) => {
                if (r && r.user_id) {
                  statsMap[r.user_id] = {
                    display_name: r.display_name,
                    avatar_url: r.avatar_url
                  };
                }
              });
              setExpertProfiles(statsMap);
            }
          }

          // Update claim publications with scores
          mappedClaim.publications = mappedClaim.publications.map((pub) => ({
            ...pub,
            rawScores: scoreMap[pub.id] || []
          }));
        }
      }

      setClaim(mappedClaim);
    } catch (err) {
      console.error('Error loading claim:', err);
      setError(err instanceof Error ? err : new Error('Failed to load claim'));
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  // Fetch on mount and when claimId changes
  useEffect(() => {
    fetchClaim();
  }, [fetchClaim]);

  return {
    claim,
    expertProfiles,
    loading,
    error,
    refetch: fetchClaim
  };
};
