import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ClaimPublicationsExpanded from './Claims/components/ClaimPublicationsExpanded';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import CategoriesLegend from './Claims/components/Legend';
import { getStanceIcon } from './Claims/utils/helpers';
import type { PublicationScoreRow } from './Claims/types';

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  source: string | null;
  stance: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
  rawScores: PublicationScoreRow[];
}

interface ClaimEvidenceData {
  id: string;
  title: string;
  description: string;
  broad_category: string | null;
  evidence_status: string | null;
  publications: Publication[];
  links: Array<{
    id: string;
    url: string;
    title: string | null;
    description: string | null;
  }>;
}

// Hook for fetching claim with publications and scores
const useClaimEvidence = (claimId: string | undefined) => {
  const [expertProfiles, setExpertProfiles] = useState<Record<string, ExpertProfile>>({});

  const query = useQuery({
    queryKey: ['claim-evidence', claimId],
    queryFn: async (): Promise<ClaimEvidenceData | null> => {
      if (!claimId) return null;

      // Fetch claim with publications
      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select('id, title, description, broad_category, evidence_status')
        .eq('id', claimId)
        .single();

      if (claimError) throw claimError;
      if (!claimData) return null;

      // Fetch publications for this claim
      const { data: publicationsData, error: pubError } = await supabase
        .from('publications')
        .select('*')
        .eq('claim_id', claimId);

      if (pubError) throw pubError;

      // Fetch links for this claim
      const { data: linksData } = await supabase
        .from('claim_links')
        .select('id, url, title, description')
        .eq('claim_id', claimId);

      // Fetch publication scores for all publications
      const pubIds = publicationsData?.map(p => p.id) || [];
      let scoresData: PublicationScoreRow[] = [];

      if (pubIds.length > 0) {
        const { data: scores, error: scoresError } = await supabase
          .from('publication_scores')
          .select('*')
          .in('publication_id', pubIds);

        if (!scoresError && scores) {
          scoresData = scores as PublicationScoreRow[];
        }
      }

      // Group scores by publication_id
      const scoresByPub: Record<string, PublicationScoreRow[]> = {};
      scoresData.forEach(score => {
        if (!scoresByPub[score.publication_id]) {
          scoresByPub[score.publication_id] = [];
        }
        scoresByPub[score.publication_id].push(score);
      });

      // Map publications with their scores - format for ClaimPublicationsExpanded
      const publications: Publication[] = (publicationsData || []).map(pub => ({
        id: pub.id,
        title: pub.title,
        authors: '',
        journal: pub.journal,
        year: pub.publication_year,
        url: pub.url || pub.doi || '',
        source: pub.source,
        stance: pub.stance as Publication['stance'],
        rawScores: scoresByPub[pub.id] || []
      }));

      return {
        id: claimData.id,
        title: claimData.title,
        description: claimData.description,
        broad_category: claimData.broad_category,
        evidence_status: claimData.evidence_status,
        publications,
        links: (linksData || []).map(l => ({
          id: l.id,
          url: l.url,
          title: l.title,
          description: l.description
        }))
      };
    },
    enabled: !!claimId
  });

  // Fetch expert profiles for all reviewers
  useEffect(() => {
    const fetchExpertProfiles = async () => {
      if (!query.data?.publications) return;

      const expertIds = new Set<string>();
      query.data.publications.forEach(pub => {
        pub.rawScores.forEach(score => {
          if (score.expert_user_id) {
            expertIds.add(score.expert_user_id);
          }
        });
      });

      if (expertIds.size === 0) return;

      const { data: statsRows } = await supabase
        .from('expert_stats')
        .select('user_id, display_name, avatar_url')
        .in('user_id', Array.from(expertIds));

      if (statsRows) {
        const profilesMap: Record<string, ExpertProfile> = {};
        statsRows.forEach(row => {
          profilesMap[row.user_id] = {
            display_name: row.display_name,
            avatar_url: row.avatar_url
          };
        });
        setExpertProfiles(profilesMap);
      }
    };

    fetchExpertProfiles();
  }, [query.data]);

  return {
    ...query,
    expertProfiles
  };
};

const ClaimEvidencePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: claim, isLoading, error, expertProfiles, refetch } = useClaimEvidence(id);

  // State for publication review dialog
  const [reviewPublication, setReviewPublication] = useState<{
    id: string;
    title: string;
    journal: string;
    publication_year: number;
    authors?: string;
    url?: string;
    existingReview?: PublicationScoreRow | null;
  } | null>(null);

  // Check if user is expert
  const [isExpert, setIsExpert] = useState(false);
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        setIsExpert(false);
        return;
      }
      try {
        const { data: expertData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'expert'
        });
        const { data: researcherData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'researcher'
        });
        setIsExpert((expertData || false) || (researcherData || false));
      } catch {
        setIsExpert(false);
      }
    };
    checkExpertStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-8 pt-24" role="main">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-12 pt-24 text-center" role="main">
          <h2 className="text-2xl font-bold mb-4">Claim Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The claim you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/claims')}>
            Browse All Claims
          </Button>
        </main>
      </div>
    );
  }

  // Filter publications by stance
  const supportingPapers = claim.publications.filter(p => p.stance === 'supporting');
  const contradictingPapers = claim.publications.filter(p => p.stance === 'contradicting');
  const hasNoPapers = claim.publications.length === 0;

  // Get links for display (if any)
  const links = claim.links.map(l => ({
    id: l.id,
    url: l.url,
    title: l.title,
    description: l.description
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <SEO
        title={`Evidence: ${claim.title}`}
        description={`View expert evidence and scientific papers for the claim: ${claim.title}`}
        url={`/claims/${id}/evidence`}
      />
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 pt-24 max-w-4xl" role="main" aria-labelledby="claim-title">
        <nav aria-label="Breadcrumb">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            aria-label="Return to claims list"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </nav>

        <article aria-labelledby="claim-title">
          <h1 id="claim-title" className="text-2xl sm:text-3xl font-bold mb-4">
            {claim.title}
          </h1>

          {/* Info Section */}
          <div className="mb-6 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              <a href="/workflow" className="inline-flex items-center gap-2 text-primary hover:underline">
                Learn how we review information and science
                <ExternalLink className="w-4 h-4" />
              </a>
            </p>
          </div>

          {/* Study Quality Legend */}
          <div className="w-full max-w-3xl mx-auto mb-8">
            <CategoriesLegend />
          </div>

          {hasNoPapers ? (
            <div className="text-center py-12 bg-card/50 rounded-lg border">
              <p className="text-muted-foreground">
                No expert evidence has been added for this claim yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Supporting Evidence Section */}
              <section aria-labelledby="supporting-heading" className="space-y-4">
                <h2 id="supporting-heading" className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                  Supporting Evidence ({supportingPapers.length})
                </h2>
                {supportingPapers.length === 0 ? (
                  <div className="bg-card/50 rounded-lg border p-6 text-center">
                    <p className="text-muted-foreground">
                      No evidence found that supports this claim.
                    </p>
                  </div>
                ) : (
                  <Card className="bg-card/50">
                    <ClaimPublicationsExpanded
                      publications={supportingPapers}
                      links={links}
                      isExpert={isExpert}
                      user={user}
                      setReviewPublication={setReviewPublication}
                      getStanceIcon={getStanceIcon}
                      expertProfiles={expertProfiles}
                    />
                  </Card>
                )}
              </section>

              {/* Contradicting Evidence Section */}
              <section aria-labelledby="contradicting-heading" className="space-y-4">
                <h2 id="contradicting-heading" className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  Contradicting Evidence ({contradictingPapers.length})
                </h2>
                {contradictingPapers.length === 0 ? (
                  <div className="bg-card/50 rounded-lg border p-6 text-center">
                    <p className="text-muted-foreground">
                      No evidence found that contradicts this claim.
                    </p>
                  </div>
                ) : (
                  <Card className="bg-card/50">
                    <ClaimPublicationsExpanded
                      publications={contradictingPapers}
                      links={[]}
                      isExpert={isExpert}
                      user={user}
                      setReviewPublication={setReviewPublication}
                      getStanceIcon={getStanceIcon}
                      expertProfiles={expertProfiles}
                    />
                  </Card>
                )}
              </section>
            </div>
          )}
        </article>
      </main>

      {/* Publication Review Dialog */}
      {user && (
        <PublicationReviewForm
          publication={reviewPublication}
          isOpen={!!reviewPublication}
          onClose={() => setReviewPublication(null)}
          onReviewSubmitted={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default ClaimEvidencePage;
