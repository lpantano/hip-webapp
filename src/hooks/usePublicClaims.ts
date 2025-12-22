import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClaimUI, PublicationScoreRow } from '@/pages/Claims/types';
import { groupBy } from '@/pages/Claims/utils/helpers';

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

interface UsePublicClaimsResult {
  claims: ClaimUI[];
  expertProfiles: Record<string, ExpertProfile>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetch 5 most recent claims from public view for homepage preview
 * Works for both authenticated and anonymous users
 */
async function fetchPublicClaims(): Promise<{
  claims: ClaimUI[];
  expertProfiles: Record<string, ExpertProfile>;
}> {
  // Fetch from the public view which contains the 5 most recent claims
  const { data: viewData, error: viewError } = await supabase
    .from('recent_claims_public')
    .select('*');

  if (viewError) throw viewError;
  if (!viewData || viewData.length === 0) {
    return { claims: [], expertProfiles: {} };
  }

  // Transform view data to ClaimUI format
  const mappedClaims: ClaimUI[] = viewData.map((row: any) => {
    // Parse JSONB arrays from the view
    const publications = (row.publications || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      authors: p.authors || '',
      journal: p.journal || '',
      year: p.year || p.publication_year || new Date(p.created_at).getFullYear(),
      url: p.url || p.doi || '',
      source: p.source || null,
      stance: p.stance,
      rawScores: [] as PublicationScoreRow[] // Will be populated below
    }));

    const links = (row.links || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      description: l.description,
      link_type: l.link_type,
      expert_user_id: l.expert_user_id
    }));

    const comments = (row.comments || []).map((c: any) => ({
      id: c.id,
      claim_id: row.id,
      expert_user_id: c.expert_user_id,
      content: c.content,
      created_at: c.created_at,
      updated_at: c.updated_at
    }));

    return {
      id: row.id,
      claim: row.title || row.description || '',
      user_id: row.user_id,
      category: row.category,
      broad_category: row.broad_category,
      labels: row.labels || [],
      votes: row.vote_count || 0,
      created_at: row.created_at,
      publications,
      links,
      comments,
      rawStatus: row.status,
      status: row.status,
      evidence_status: row.evidence_status
    };
  });

  // Fetch publication scores from public view
  const pubIds = mappedClaims.flatMap(c => c.publications.map(p => p.id));
  let expertProfiles: Record<string, ExpertProfile> = {};

  if (pubIds.length > 0) {
    const { data: scoreRows, error: scoreErr } = await supabase
      .from('publication_scores_public')
      .select('*')
      .in('publication_id', pubIds);

    if (!scoreErr && scoreRows) {
      // Group scores by publication_id
      const scoreMap: Record<string, PublicationScoreRow[]> = {};
      const expertIdsSet = new Set<string>();

      scoreRows.forEach((r: any) => {
        const scoreRow: PublicationScoreRow = {
          id: r.id,
          publication_id: r.publication_id,
          expert_user_id: r.expert_user_id,
          review_data: r.review_data,
          comments: r.comments,
          created_at: r.created_at,
          updated_at: r.updated_at
        };

        if (!scoreMap[r.publication_id]) scoreMap[r.publication_id] = [];
        scoreMap[r.publication_id].push(scoreRow);
        if (r.expert_user_id) expertIdsSet.add(r.expert_user_id);
      });

      // Fetch expert profiles from public view
      const expertIds = Array.from(expertIdsSet);
      if (expertIds.length > 0) {
        const { data: profileRows, error: profileErr } = await supabase
          .from('expert_profiles_public')
          .select('user_id, display_name, avatar_url')
          .in('user_id', expertIds);

        if (!profileErr && profileRows) {
          const profilesMap: Record<string, ExpertProfile> = {};
          profileRows.forEach((r: any) => {
            if (r && r.user_id) {
              profilesMap[r.user_id] = {
                display_name: r.display_name,
                avatar_url: r.avatar_url
              };
            }
          });
          expertProfiles = profilesMap;
        }
      }

      // Update claims with scores
      mappedClaims.forEach((claim) => {
        claim.publications = claim.publications.map((pub) => ({
          ...pub,
          rawScores: scoreMap[pub.id] || []
        }));
      });
    }
  }

  return { claims: mappedClaims, expertProfiles };
}

/**
 * React hook to fetch public claims preview
 */
export function usePublicClaims(): UsePublicClaimsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-claims'],
    queryFn: fetchPublicClaims,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    claims: data?.claims || [],
    expertProfiles: data?.expertProfiles || {},
    isLoading,
    error: error instanceof Error ? error : null
  };
}
