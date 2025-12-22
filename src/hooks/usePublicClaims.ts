import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClaimUI, PublicationScoreRow } from '@/pages/Claims/types';
import type { Database } from '@/integrations/supabase/types';

type RecentClaimRow = Database['public']['Views']['recent_claims_public']['Row'];
type PublicationScoreViewRow = Database['public']['Views']['publication_scores_public']['Row'];
type ExpertProfileViewRow = Database['public']['Views']['expert_profiles_public']['Row'];

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
  const mappedClaims: ClaimUI[] = viewData.map((row: RecentClaimRow) => {
    // Parse JSONB arrays from the view
    const publicationsRaw = (row.publications as unknown[] | null) || [];
    const publications = publicationsRaw.map((p: unknown) => {
      const pub = p as Record<string, unknown>;
      return {
        id: String(pub.id || ''),
        title: String(pub.title || ''),
        authors: '', // authors field doesn't exist in publications table
        journal: String(pub.journal || ''),
        year: Number(pub.publication_year || (pub.created_at ? new Date(String(pub.created_at)).getFullYear() : new Date().getFullYear())),
        url: String(pub.url || pub.doi || ''),
        source: pub.source ? String(pub.source) : undefined,
        stance: pub.stance as 'supporting' | 'contradicting' | 'neutral' | 'mixed' | undefined,
        rawScores: [] as PublicationScoreRow[]
      };
    });

    const linksRaw = (row.links as unknown[] | null) || [];
    const links = linksRaw.map((l: unknown) => {
      const link = l as Record<string, unknown>;
      return {
        id: String(link.id || ''),
        title: String(link.title || ''),
        url: String(link.url || ''),
        description: String(link.description || ''),
        link_type: String(link.link_type || ''),
        expert_user_id: String(link.expert_user_id || '')
      };
    });

    const commentsRaw = (row.comments as unknown[] | null) || [];
    const comments = commentsRaw.map((c: unknown) => {
      const comment = c as Record<string, unknown>;
      return {
        id: String(comment.id || ''),
        claim_id: String(row.id || ''),
        expert_user_id: String(comment.expert_user_id || ''),
        content: String(comment.content || ''),
        created_at: String(comment.created_at || ''),
        updated_at: String(comment.updated_at || '')
      };
    });

    return {
      id: String(row.id || ''),
      claim: String(row.title || row.description || ''),
      user_id: String(row.user_id || ''),
      category: row.category!,
      broad_category: row.broad_category!,
      labels: row.labels || [],
      votes: Number(row.vote_count || 0),
      created_at: String(row.created_at || ''),
      publications,
      links,
      comments,
      rawStatus: row.status as string,
      status: row.status as ClaimUI['status'],
      evidence_status: row.evidence_status as ClaimUI['evidence_status']
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

      scoreRows.forEach((r: PublicationScoreViewRow) => {
        const scoreRow: PublicationScoreRow = {
          id: String(r.id || ''),
          publication_id: String(r.publication_id || ''),
          expert_user_id: String(r.expert_user_id || ''),
          review_data: r.review_data as PublicationScoreRow['review_data'],
          comments: r.comments || null,
          created_at: String(r.created_at || ''),
          updated_at: String(r.updated_at || '')
        };

        const pubId = String(r.publication_id || '');
        if (!scoreMap[pubId]) scoreMap[pubId] = [];
        scoreMap[pubId].push(scoreRow);
        if (r.expert_user_id) expertIdsSet.add(String(r.expert_user_id));
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
          profileRows.forEach((r: ExpertProfileViewRow) => {
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
