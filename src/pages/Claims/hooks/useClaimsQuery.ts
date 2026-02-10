import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { ClaimUI, ClaimRow, ClaimCommentRow, PublicationRow, ClaimLinkRow, PublicationScoreRow } from '../types';
import { groupBy } from '../utils/helpers';
import { CLAIMS_PER_PAGE } from '../constants';

interface UseClaimsQueryParams {
  sortBy: 'votes' | 'recent';
  filterByLabel: string;
  selectedEvidenceStatuses: string[];
  debouncedSearchQuery: string;
  userId: string | null;
}

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

interface ClaimsQueryResult {
  claims: ClaimUI[];
  totalClaims: number;
  hasMoreClaims: boolean;
  userVotes: Set<string>;
  expertProfiles: Record<string, ExpertProfile>;
}

export const useClaimsQuery = ({
  sortBy,
  filterByLabel,
  selectedEvidenceStatuses,
  debouncedSearchQuery,
  userId
}: UseClaimsQueryParams) => {
  return useInfiniteQuery({
    queryKey: [
      'claims',
      sortBy,
      filterByLabel,
      selectedEvidenceStatuses,
      debouncedSearchQuery,
      userId
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ClaimsQueryResult> => {
      // Build the claims query with pagination, filtering, and sorting
      let claimsQuery = supabase
        .from('claims')
        .select('*', { count: 'exact' })
        .range(pageParam * CLAIMS_PER_PAGE, (pageParam + 1) * CLAIMS_PER_PAGE - 1);

      // Apply label filter
      if (filterByLabel !== 'all') {
        claimsQuery = claimsQuery.contains('labels', [filterByLabel]);
      }

      // Apply search filter
      if (debouncedSearchQuery.trim()) {
        claimsQuery = claimsQuery.ilike('title', `%${debouncedSearchQuery.trim()}%`);
      }

      // Apply evidence status filter
      if (selectedEvidenceStatuses.length > 0 && selectedEvidenceStatuses.length < 4) {
        const hasAwaitingEvidence = selectedEvidenceStatuses.includes('Awaiting Evidence');
        const otherStatuses = selectedEvidenceStatuses.filter(s => s !== 'Awaiting Evidence');

        if (hasAwaitingEvidence && otherStatuses.length > 0) {
          // Combine NULL check + enum values with OR
          const statusList = otherStatuses.map(s => `"${s}"`).join(',');
          claimsQuery = claimsQuery.or(
            `evidence_status.is.null,evidence_status.eq.Awaiting Evidence,evidence_status.in.(${statusList})`
          );
        } else if (hasAwaitingEvidence) {
          // Only awaiting evidence (includes NULL)
          claimsQuery = claimsQuery.or('evidence_status.is.null,evidence_status.eq.Awaiting Evidence');
        } else if (otherStatuses.length === 1) {
          // Single specific status - use equality for efficiency
          claimsQuery = claimsQuery.eq('evidence_status', otherStatuses[0] as Database['public']['Enums']['evidence_status_type']);
        } else {
          // Multiple specific statuses (not awaiting evidence)
          claimsQuery = claimsQuery.in('evidence_status', otherStatuses as Database['public']['Enums']['evidence_status_type'][]);
        }
      }
      // If all 4 selected or empty, no filter applied (shows all claims)

      // Apply sorting with secondary keys for stable pagination
      if (sortBy === 'votes') {
        claimsQuery = claimsQuery
          .order('vote_count', { ascending: false })
          .order('created_at', { ascending: false })
          .order('id', { ascending: true });
      } else {
        claimsQuery = claimsQuery
          .order('created_at', { ascending: false })
          .order('id', { ascending: true });
      }

      // Batch the first set of queries in parallel
      const [
        { data: claimsData, error: claimsError, count },
        { data: userVotesData, error: votesError }
      ] = await Promise.all([
        claimsQuery,
        userId
          ? supabase.from('claim_votes').select('claim_id').eq('user_id', userId)
          : Promise.resolve({ data: null, error: null })
      ]);

      if (claimsError) throw claimsError;

      // Calculate pagination info
      const totalClaims = count || 0;
      const totalPages = Math.ceil(totalClaims / CLAIMS_PER_PAGE);
      const hasMoreClaims = pageParam < totalPages - 1;

      // Batch the claim-dependent queries in parallel
      const claimIds = claimsData?.map(c => c.id) || [];
      const [
        { data: publicationsData, error: publicationsError },
        { data: commentsData, error: commentsError },
        { data: linksData, error: linksError }
      ] = await Promise.all([
        supabase.from('publications').select('*').in('claim_id', claimIds),
        supabase.from('claim_comments').select('*').in('claim_id', claimIds).order('created_at', { ascending: true }),
        supabase.from('claim_links').select('*').in('claim_id', claimIds)
      ]);

      if (publicationsError) throw publicationsError;
      if (commentsError) throw commentsError;

      // Use groupBy helper for cleaner data organization
      const publicationsByClaim = groupBy(publicationsData || [], (pub: PublicationRow) => pub.claim_id);
      const commentsByClaim = groupBy(commentsData || [], (comment: ClaimCommentRow) => comment.claim_id);
      const linksByClaim = groupBy((linksData || []) as ClaimLinkRow[], (link) => link.claim_id);

      const mappedClaims: ClaimUI[] = (claimsData || []).map((c: ClaimRow) => {
        // map publications for this claim
        const claimPublications = publicationsByClaim[c.id] || [];
        const pubs = claimPublications.map((p: PublicationRow) => {
          return {
            id: p.id,
            title: p.title,
            authors: p.authors || '',
            journal: p.journal || '',
            year: p.publication_year || (p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear()),
            url: p.url || p.doi || '',
            source: p.source || null,
            stance: p.stance,
            rawScores: []
          };
        });

        return {
          id: c.id,
          claim: c.title || c.description || '',
          user_id: c.user_id,
          category: c.category,
          broad_category: c.broad_category,
          labels: c.labels || [],
          votes: c.vote_count || 0,
          created_at: c.created_at,
          publications: pubs,
          links: (linksByClaim[c.id] || []).map(l => ({
            id: l.id,
            title: l.title,
            url: l.url,
            description: l.description,
            link_type: l.link_type,
            expert_user_id: l.expert_user_id
          })),
          comments: commentsByClaim[c.id] || [],
          rawStatus: c.status,
          status: c.status as ClaimUI['status'],
          evidence_status: 'evidence_status' in c ? (c.evidence_status as ClaimUI['evidence_status']) : null
        };
      });

      // Fetch publication scores and expert profiles
      const pubIds = mappedClaims.flatMap(c => c.publications.map(p => p.id));
      const expertProfiles: Record<string, ExpertProfile> = {};

      if (pubIds.length > 0) {
        const { data: scoreRows, error: scoreErr } = await supabase
          .from('publication_scores')
          .select('*')
          .in('publication_id', pubIds as string[]);

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
              .in('user_id', expertIds as string[]);

            if (!statsErr && statsRows) {
              statsRows.forEach((r) => {
                if (!r || typeof r !== 'object') return;
                const key = r.user_id;
                if (!key) return;
                expertProfiles[key] = {
                  display_name: r.display_name,
                  avatar_url: r.avatar_url
                };
              });
            }
          }

          // Update claims with scores
          mappedClaims.forEach((cl) => {
            cl.publications.forEach((pub) => {
              const rows = scoreMap[pub.id] || [];
              pub.rawScores = rows;
            });
          });
        }
      }

      // Set user votes
      const userVotes: Set<string> = !votesError && userVotesData
        ? new Set(userVotesData.map((v) => String(v.claim_id)))
        : new Set();



      return {
        claims: mappedClaims,
        totalClaims,
        hasMoreClaims,
        userVotes,
        expertProfiles
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMoreClaims ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
