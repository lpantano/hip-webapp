import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Info, ChevronDown } from 'lucide-react';
import { SubscribeButton } from '@/components/claims/SubscribeButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ClaimPublicationsExpanded from './Claims/components/ClaimPublicationsExpanded';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import CategoriesLegend from './Claims/components/Legend';
import { getStanceIcon, getEvidenceStatusColor } from './Claims/utils/helpers';
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

  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  // State for evidence info dialog
  const [showEvidenceInfo, setShowEvidenceInfo] = useState(false);

  // State for collapsible sections
  const [supportingOpen, setSupportingOpen] = useState(true);
  const [contradictingOpen, setContradictingOpen] = useState(true);

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
          <Button onClick={() => navigate('/')}>
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
        <nav aria-label="Breadcrumb" className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              aria-label="Return to claims list"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {claim && <SubscribeButton claimId={claim.id} />}
          </div>
          <a href="/workflow" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            Learn how we review information and science
            <ExternalLink className="w-4 h-4" />
          </a>
        </nav>

        <article aria-labelledby="claim-title">
          {/* Evidence Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            {claim.evidence_status && (
              <Badge className={`${getEvidenceStatusColor(claim.evidence_status)} pointer-events-none transition-none px-4 py-1 text-sm`}>
                {claim.evidence_status}
              </Badge>
            )}
            <button
              onClick={() => setShowEvidenceInfo(true)}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Learn about evidence status"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <h1 id="claim-title" className="text-2xl sm:text-3xl font-bold mb-4">
            {claim.title}
          </h1>

          

          

          {hasNoPapers ? (
            <div className="text-center py-12 bg-card/50 rounded-lg border">
              <p className="text-muted-foreground">
                {!user
                  ? 'Sign in to view the evidence for this claim.'
                  : 'No expert evidence has been added for this claim yet.'}
              </p>
              {!user && (
                <Button className="mt-4" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Supporting Evidence Section */}
              <section aria-labelledby="supporting-heading" className="space-y-4">
                <button
                  onClick={() => setSupportingOpen(prev => !prev)}
                  className="flex items-center gap-3 text-xl sm:text-2xl font-bold w-full text-left cursor-pointer"
                  aria-expanded={supportingOpen}
                  aria-controls="supporting-content"
                >
                  <span className="w-1 self-stretch rounded-full bg-teal-500" aria-hidden="true" />
                  <span id="supporting-heading">Supporting Evidence</span>
                  <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 rounded-full bg-teal-500 text-white text-sm font-semibold px-2">
                    {supportingPapers.length}
                  </span>
                  <ChevronDown className={`w-5 h-5 ml-auto text-muted-foreground transition-transform duration-200 ${supportingOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                {supportingOpen && (
                  <div id="supporting-content">
                    {supportingPapers.length === 0 ? (
                      <div className="bg-card/50 rounded-lg border p-6 text-center">
                        <p className="text-muted-foreground">
                          No evidence found that supports this claim.
                        </p>
                      </div>
                    ) : (
                      <ClaimPublicationsExpanded
                        publications={supportingPapers}
                        links={links}
                        isExpert={isExpert}
                        user={user}
                        setReviewPublication={setReviewPublication}
                        getStanceIcon={getStanceIcon}
                        expertProfiles={expertProfiles}
                      />
                    )}
                  </div>
                )}
              </section>

              {/* Contradicting Evidence Section */}
              <section aria-labelledby="contradicting-heading" className="space-y-4">
                <button
                  onClick={() => setContradictingOpen(prev => !prev)}
                  className="flex items-center gap-3 text-xl sm:text-2xl font-bold w-full text-left cursor-pointer"
                  aria-expanded={contradictingOpen}
                  aria-controls="contradicting-content"
                >
                  <span className="w-1 self-stretch rounded-full bg-orange-500" aria-hidden="true" />
                  <span id="contradicting-heading">Contradicting Evidence</span>
                  <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 rounded-full bg-orange-500 text-white text-sm font-semibold px-2">
                    {contradictingPapers.length}
                  </span>
                  <ChevronDown className={`w-5 h-5 ml-auto text-muted-foreground transition-transform duration-200 ${contradictingOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                {contradictingOpen && (
                  <div id="contradicting-content">
                    {contradictingPapers.length === 0 ? (
                      <div className="bg-card/50 rounded-lg border p-6 text-center">
                        <p className="text-muted-foreground">
                          No evidence found that contradicts this claim.
                        </p>
                      </div>
                    ) : (
                      <ClaimPublicationsExpanded
                        publications={contradictingPapers}
                        links={[]}
                        isExpert={isExpert}
                        user={user}
                        setReviewPublication={setReviewPublication}
                        getStanceIcon={getStanceIcon}
                        expertProfiles={expertProfiles}
                      />
                    )}
                  </div>
                )}
              </section>
              {/* Study Quality Legend */}
              <div className="w-full max-w-3xl mx-auto mb-8">
                <CategoriesLegend />
              </div>
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

      {/* Evidence Info Dialog */}
      {showEvidenceInfo && (
        <Dialog open={showEvidenceInfo} onOpenChange={() => setShowEvidenceInfo(false)}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogTitle>Understanding Evidence</DialogTitle>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Evidence Status</h3>
                <p className="text-muted-foreground mb-3">
                  The evidence status badge indicates the overall quality and reliability of evidence for
                  this claim based on expert reviews.
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Paper Stances</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <strong>Reported to Support:</strong> Papers that have been reported by sources to
                    support this claim.
                  </div>
                  <div>
                    <strong>Reported to Disprove:</strong> Papers that have been reported by sources to
                    disprove or contradict this claim.
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClaimEvidencePage;
