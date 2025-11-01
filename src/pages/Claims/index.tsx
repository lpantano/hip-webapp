import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { aggregatePublicationReviewData } from '@/lib/label-aggregation';
// Dialog and DialogTitle already imported above (with DialogTitle). Removed duplicate import.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { ChevronUp, ExternalLink, Users, Heart, Eye, BookOpen, DollarSign, Plus, Filter, FileText, CheckCircle, XCircle, Lock, LogIn, FileWarning, ThumbsDown, ThumbsUp, Link, Unlink2, Link2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { ClaimSubmissionForm } from '@/components/forms/ClaimSubmissionForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PaperSubmissionForm } from '@/components/forms/PaperSubmissionForm';
import PublicationReviewForm from '@/components/forms/PublicationReviewForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourcesSection } from '@/components/resources/ResourcesSection';
import { getClassificationReasons } from '@/types/review';
import { getEvidenceClassificationColor } from '@/lib/classification-colors';
import { aggregateLabelsForClaim } from '@/lib/label-aggregation';
import quality from '@/lib/quality-colors';
import ClaimLabelsStack from '@/pages/Claims/components/ClaimLabelsStack';
import { getCategoryColor } from '@/lib/getCategoryColor';
import ClaimLinksSection from './components/ClaimLinksSection';
import ClaimPublicationsExpanded from './components/ClaimPublicationsExpanded';
import type { Database } from '@/integrations/supabase/types';
import type { ClaimUI, ClaimRow, ClaimCommentRow, PublicationRow, ClaimLinkRow, PublicationScoreRow } from './types';


// We'll load claims from Supabase. The UI expects a specific shape so we map DB rows into that shape.

const CLAIMS_PER_PAGE = 20;

const Claims = () => {
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [hasMoreClaims, setHasMoreClaims] = useState(true);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [filterByCategory, setFilterByCategory] = useState<Database['public']['Enums']['claim_category'] | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState<string | null>(null);
  const [showSourceForm, setShowSourceForm] = useState<string | null>(null);
  const [reviewPublication, setReviewPublication] = useState<{ id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null>(null);
  const [expertProfiles, setExpertProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null }>>({});
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [showReelClaim, setShowReelClaim] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Source dialog form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceDescription, setSourceDescription] = useState('');
  const [sourceType, setSourceType] = useState('webpage');
  const [sourceSubmitting, setSourceSubmitting] = useState(false);
  const { toast } = useToast();

  // Confirmation dialog state for toggling claim status
  const [confirmToggleClaimId, setConfirmToggleClaimId] = useState<string | null>(null);
  const [confirmToggleRawStatus, setConfirmToggleRawStatus] = useState<string | null>(null);

  // Normalize and validate URL client-side. Returns normalized URL string or null if invalid.
  const normalizeUrl = (raw: string) => {
    if (!raw) return null;
    let s = raw.trim();
    // If scheme is missing, default to https://
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) {
      s = `https://${s}`;
    }
    try {
      const parsed = new URL(s);
      // Basic check: must have hostname
      if (!parsed.hostname) return null;
      return parsed.toString();
    } catch (e) {
      return null;
    }
  };

  // component-scoped Supabase client
  const sb = supabase;

  // Check if user is expert or researcher
  const [isExpert, setIsExpert] = useState(false);
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user) {
        setIsExpert(false);
        return;
      }

      try {
        // Check if user has expert or researcher role in user_roles table
        const { data } = await sb.rpc('has_role', {
          _user_id: user.id,
          _role: 'expert'
        });

        const { data: researcherData } = await sb.rpc('has_role', {
          _user_id: user.id,
          _role: 'researcher'
        });

        setIsExpert((data || false) || (researcherData || false));
      } catch (error) {
        console.error('Error checking expert/researcher status:', error);
        setIsExpert(false);
      }
    };

    checkExpertStatus();
  }, [user, sb]);



  const fetchClaimsData = useCallback(async (page: number = 0) => {
    try {
      // Build the claims query with pagination, filtering, and sorting
      let claimsQuery = sb
        .from('claims')
        .select('*', { count: 'exact' })
        .range(page * CLAIMS_PER_PAGE, (page + 1) * CLAIMS_PER_PAGE - 1);

      // Apply category filter
      if (filterByCategory !== 'all') {
        claimsQuery = claimsQuery.eq('category', filterByCategory);
      }

      // Apply sorting
      if (sortBy === 'votes') {
        claimsQuery = claimsQuery.order('vote_count', { ascending: false });
      } else {
        claimsQuery = claimsQuery.order('created_at', { ascending: false });
      }

      // Batch the first set of queries in parallel for better performance
      const [
        { data: claimsData, error: claimsError, count },
        { data: userVotesData, error: votesError }
      ] = await Promise.all([
        claimsQuery,
        user ? sb.from('claim_votes').select('claim_id').eq('user_id', user.id) : Promise.resolve({ data: null, error: null })
      ]);

      if (claimsError) throw claimsError;

      // Update pagination state
      setTotalClaims(count || 0);
      const totalPages = Math.ceil((count || 0) / CLAIMS_PER_PAGE);
      setHasMoreClaims(page < totalPages - 1);

      // Batch the claim-dependent queries in parallel
      const claimIds = claimsData?.map(c => c.id) || [];
      const [
        { data: publicationsData, error: publicationsError },
        { data: commentsData, error: commentsError },
        { data: linksData, error: linksError }
      ] = await Promise.all([
        sb.from('publications').select('*').in('claim_id', claimIds),
        sb.from('claim_comments').select('*').in('claim_id', claimIds).order('created_at', { ascending: true }),
        sb.from('claim_links').select('*').in('claim_id', claimIds)
      ]);

      if (publicationsError) throw publicationsError;
      if (commentsError) throw commentsError;

      // Group publications by claim_id
      const publicationsByClaim: Record<string, PublicationRow[]> = {};
      (publicationsData || []).forEach((pub: PublicationRow) => {
        if (!publicationsByClaim[pub.claim_id]) {
          publicationsByClaim[pub.claim_id] = [];
        }
        publicationsByClaim[pub.claim_id].push(pub);
      });

      // Group comments by claim_id
      const commentsByClaim: Record<string, ClaimCommentRow[]> = {};
      (commentsData || []).forEach((comment: ClaimCommentRow) => {
        if (!commentsByClaim[comment.claim_id]) {
          commentsByClaim[comment.claim_id] = [];
        }
        commentsByClaim[comment.claim_id].push(comment);
      });

      // Group claim_links by claim_id
      const linksByClaim: Record<string, ClaimLinkRow[]> = {};
      ((linksData || []) as ClaimLinkRow[]).forEach((link) => {
        if (!linksByClaim[link.claim_id]) linksByClaim[link.claim_id] = [];
        linksByClaim[link.claim_id].push(link);
      });



      const mappedClaims: ClaimUI[] = (claimsData || []).map((c: ClaimRow) => {
        // map publications for this claim
        const claimPublications = publicationsByClaim[c.id] || [];
        const pubs = claimPublications.map((p: PublicationRow) => {
          return {
            id: p.id, // Add publication ID
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
          votes: c.vote_count || 0,
          publications: pubs,
          links: (linksByClaim[c.id] || []).map(l => ({ id: l.id, title: l.title, url: l.url, description: l.description, link_type: l.link_type, expert_user_id: l.expert_user_id })),
          comments: commentsByClaim[c.id] || [],
          // preserve DB enum/status values directly as requested
          rawStatus: c.status,
          status: c.status as ClaimUI['status']
        };
      });

      setClaims(mappedClaims);

      // Set user votes from the batched query above
      if (!votesError && userVotesData) {
        setUserVotes(new Set(userVotesData.map(v => v.claim_id)));
      } else {
        setUserVotes(new Set());
      }

      // Batch the final queries for publication scores and expert profiles
      try {
        const pubIds = mappedClaims.flatMap(c => c.publications.map(p => p.id));
        if (pubIds.length > 0) {
          // Fetch scores first to determine which experts we need
          const { data: scoreRows, error: scoreErr } = await sb
            .from('publication_scores')
            .select('*')
            .in('publication_id', pubIds as string[]);

          if (!scoreErr && scoreRows) {
            const scoreRowsTyped = scoreRows as PublicationScoreRow[];
            const scoreMap: Record<string, PublicationScoreRow[]> = {};
            const expertIdsSet = new Set<string>();

            // Build score map and collect expert IDs in one pass
            scoreRowsTyped.forEach((r) => {
              if (!scoreMap[r.publication_id]) scoreMap[r.publication_id] = [];
              scoreMap[r.publication_id].push(r);
              if (r.expert_user_id) expertIdsSet.add(r.expert_user_id);
            });

            // Fetch expert profiles in parallel with updating claims
            const expertIds = Array.from(expertIdsSet);
            const expertProfilesPromise = expertIds.length > 0
              ? sb.from('expert_stats').select('user_id, display_name, avatar_url').in('user_id', expertIds as string[])
              : Promise.resolve({ data: null, error: null });

            const [{ data: statsRows, error: statsErr }] = await Promise.all([
              expertProfilesPromise
            ]);

            // Update claims with scores
            const updatedClaims = mappedClaims.map((cl) => ({
              ...cl,
              publications: cl.publications.map((pub) => {
                const rows = scoreMap[pub.id] || pub.rawScores || [];
                return {
                  ...pub,
                  rawScores: rows
                };
              })
            }));

            setClaims(updatedClaims);

            // Set expert profiles
            if (!statsErr && statsRows) {
              const statsMap: Record<string, { display_name?: string | null; avatar_url?: string | null }> = {};
              (statsRows as unknown[]).forEach((r) => {
                if (!r || typeof r !== 'object') return;
                const rec = r as Record<string, unknown>;
                const key = typeof rec.user_id === 'string' ? rec.user_id : null;
                if (!key) return;
                const display = typeof rec.display_name === 'string' ? rec.display_name : null;
                const avatar = typeof rec.avatar_url === 'string' ? rec.avatar_url : null;
                statsMap[key] = { display_name: display, avatar_url: avatar };
              });
              setExpertProfiles(prev => ({ ...prev, ...statsMap }));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load publication_scores', e);
      }
    } catch (err) {
      console.error('Error loading claims:', err);
    }
  }, [sb, user, filterByCategory, sortBy]);

  // Move fetchData outside useEffect so it can be called from form submission
  const fetchData = useCallback(async (page: number = 0) => {
    setLoading(true);
    try {
      // Fetch claims data for the specified page
      await fetchClaimsData(page);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchClaimsData]);

  // Load data when filters, sorting, or page changes
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [filterByCategory, sortBy, currentPage]);

  const handleVote = async (id: string) => {
    if (!user) {
      console.warn('User not authenticated');
      return;
    }

    const hasVoted = userVotes.has(id);

    // Optimistic UI update
    if (hasVoted) {
      // Remove vote
      setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
      setUserVotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      // Add vote
      setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: claim.votes + 1 } : claim));
      setUserVotes(prev => new Set(prev).add(id));
    }

    try {
      if (hasVoted) {
        // Remove vote from database
        const { error: delError } = await sb.from('claim_votes').delete().eq('claim_id', id).eq('user_id', user.id);
        if (delError) throw delError;
      } else {
        // Add vote to database
        const { error: insertError } = await sb.from('claim_votes').insert({ claim_id: id, user_id: user.id });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Vote failed:', err);
      // Revert optimistic update on error
      if (hasVoted) {
        // Restore vote
        setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: claim.votes + 1 } : claim));
        setUserVotes(prev => new Set(prev).add(id));
      } else {
        // Remove vote
        setClaims(prev => prev.map(claim => claim.id === id ? { ...claim, votes: Math.max(0, claim.votes - 1) } : claim));
        setUserVotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const humanize = (s?: string) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

  // moved getCategoryColor to src/lib/getCategoryColor.ts for reuse across the app

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'under review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStanceIcon = (stance: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null | undefined) => {
    switch (stance) {
      case 'supporting':
        return <div title="Supporting evidence"><Link2 className="w-4 h-4 text-grey-600" /></div>;
      case 'contradicting':
        return <div title="Contradicting evidence"><Unlink2 className="w-4 h-4 text-grey-600" /></div>;
      case 'neutral':
        return <div className="w-4 h-4 rounded-full bg-gray-400" title="Neutral evidence" />;
      case 'mixed':
        return <div className="w-4 h-4 rounded-full bg-orange-400" title="Mixed evidence" />;
      default:
        return null;
    }
  };

  const toggleClaimStatus = async (claimId: string, rawStatus?: string) => {
    if (!user) return;
    // Only allow toggle between 'proposed' and 'pending' ('under review')
    if (rawStatus !== 'proposed' && rawStatus !== 'under review') return;

    const newStatus = rawStatus === 'proposed' ? 'under review' : 'proposed';
    try {
      setUpdatingStatus(claimId);
      const { error } = await sb.from('claims').update({ status: newStatus }).eq('id', claimId);
      if (error) throw error;
      // Refresh data
      await fetchData(currentPage);
      toast({ title: 'Status updated', description: `Claim status set to ${newStatus}.` });
    } catch (e: unknown) {
      console.error('Failed to update claim status', e);
      const msg = e instanceof Error ? e.message : 'Failed to update status';
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Confirm + toggle flow: user clicks badge -> open dialog -> confirmAndToggle calls toggleClaimStatus
  const confirmAndToggle = async () => {
    if (!confirmToggleClaimId || !confirmToggleRawStatus) {
      setConfirmToggleClaimId(null);
      setConfirmToggleRawStatus(null);
      return;
    }
    try {
      await toggleClaimStatus(confirmToggleClaimId, confirmToggleRawStatus);
    } finally {
      setConfirmToggleClaimId(null);
      setConfirmToggleRawStatus(null);
    }
  };

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };



  // Individual expert review cards
  type ExpertReviewCard = {
    publication: {
      id: string;
      title: string;
      journal: string;
      year: number;
      authors: string;
      source?: string | null;
    };
    expert: {
      expert_user_id: string;
      display_name?: string | null;
      avatar_url?: string | null;
      // Show the current scores for each category; score may be null when not provided
      scores: Array<{
        category: string;
        score?: 'PASS' | 'NO' | 'NA' | null;
      }>;
      comments: Array<{
        content: string;
        created_at: string;
      }>;
      classification?: string | null;
      tags?: {
        testedInHuman?: boolean;
        ethnicityLabels?: string[];
        ageRanges?: string[];
      } | null;
      womenNotIncluded?: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviewData?: any;
    };
  };

  const ExpertReviewsReel: React.FC<{ reviewCards: ExpertReviewCard[] }> = ({ reviewCards }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    if (!reviewCards || reviewCards.length === 0) {
      return <div className="text-sm text-muted-foreground">No reviews yet for this claim.</div>;
    }

    return (
      <div className="relative">
        <div
          ref={containerRef}
          className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] p-2"
          role="list"
          aria-label=""
        >
            {reviewCards.map((reviewCard) => {
            // Extract tags from the reviewCard (if present)
            // The tags are not currently passed in the reviewCard, so we need to get them from classification or add them to the reviewCard in the parent if possible.
            // For now, try to get them from the expert.classification if it is an object (future-proofing), else skip.
            // But the correct way is to pass tags in the reviewCard.expert, so let's check if they exist.
            const tags = reviewCard.expert.tags || null;
            return (
              <div key={`${reviewCard.publication.id}-${reviewCard.expert.expert_user_id}`} className="bg-background border border-border rounded-lg p-4 shadow-sm">
                {/* Top row: Avatar + Publication info */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex flex-col items-center gap-2 w-24">
                    {reviewCard.expert.avatar_url ? (
                      <img
                        src={reviewCard.expert.avatar_url}
                        alt={reviewCard.expert.display_name || 'Expert'}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-sm flex items-center justify-center"
                      style={{ display: reviewCard.expert.avatar_url ? 'none' : 'flex' }}
                    >
                      {(reviewCard.expert.display_name || 'E').split(' ').map(n => n[0]).slice(0,2).join('')}
                    </div>
                    <div className="font-semibold text-sm text-center">{reviewCard.expert.display_name || 'Expert'}</div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{reviewCard.publication.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {reviewCard.publication.authors} • {reviewCard.publication.journal} ({reviewCard.publication.year})
                      {reviewCard.publication.source && (
                        <>
                          {' • '}
                          <a
                            href={reviewCard.publication.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            title="View source"
                          >
                            Source <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </p>
                    <br></br>
                    {reviewCard.expert.classification && (
                    <div className="flex items-start gap-3 mb-2">
                      <Badge className={`text-xs ${getEvidenceClassificationColor(String(reviewCard.expert.classification))} pointer-events-none transition-none`}>
                        {String(reviewCard.expert.classification).charAt(0).toUpperCase() + String(reviewCard.expert.classification).slice(1)}
                      </Badge>

                      {reviewCard.expert.reviewData &&
                        (reviewCard.expert.classification === 'Invalid' ||
                          reviewCard.expert.classification === 'Unreliable' ||
                          reviewCard.expert.classification === 'Fallacy') && (
                          <div className="flex-1">
                            {(() => {
                              const reasons = getClassificationReasons(reviewCard.expert.reviewData);
                              if (reasons.length > 0) {
                                return (
                                  <div className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                    {reasons.map((reason, i) => (
                                      <div key={i}>{reason}</div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                    </div>
                  )}

                  {tags && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(tags.ethnicityLabels) && tags.ethnicityLabels.length > 0 && (
                        <span className="text-xs flex items-center gap-1">
                          <span className="font-medium">Ethnicities:</span>
                          {tags.ethnicityLabels.map((eth: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{eth}</Badge>
                          ))}
                        </span>
                      )}
                      {Array.isArray(tags.ageRanges) && tags.ageRanges.length > 0 && (
                        <span className="text-xs flex items-center gap-1">
                          <span className="font-medium">Ages:</span>
                          {tags.ageRanges.map((age: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{age}</Badge>
                          ))}
                        </span>
                      )}
                    </div>
                  )}

                  {reviewCard.expert.womenNotIncluded && (
                    <div className="mb-2">
                      <Badge className="text-xs bg-red-100 text-red-800">
                        ♀ Women Not Included
                      </Badge>
                    </div>
                  )}
                  </div>

                </div>

                {/* Bottom row: Review content (classification, tags, scores, comments) */}
                <div className="mt-2">


                  {reviewCard.expert.scores.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-row flex-wrap gap-3 items-center">
                        {reviewCard.expert.scores.map((scoreItem, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            {(() => {
                              const explanations: Record<string, string> = {
                                studyDesign: 'Was the study designed to answer this claim?',
                                // representation removed from UI/labels — kept in DB for backward compatibility but not surfaced
                                controlGroup: 'Was there a proper control group (wildtype, baseline, placebo, standard of care, matched cohort)?',
                                biasAddressed: 'Were confounding variables identified and tracked (e.g., time, age, sex, comorbidities, socioeconomic factors)?',
                                statistics: 'Were statistical tests appropriate for the study design and data type?'
                              };
                              const humanLabels: Record<string, string> = {
                                studyDesign: 'Study Design',
                                controlGroup: 'Control Group',
                                biasAddressed: 'Bias Addressed',
                                statistics: 'Statistics'
                              };
                              const label = humanLabels[scoreItem.category] || scoreItem.category;
                              const explanation = explanations[scoreItem.category] || '';
                              return explanation ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <span className="text-sm text-muted-foreground underline decoration-dotted cursor-help">{label}:</span>
                                  </PopoverTrigger>
                                  <PopoverContent side="top" className="max-w-xs text-xs p-2">
                                    {explanation}
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <span className="text-sm text-muted-foreground">{label}:</span>
                              );
                            })()}
                            <Badge className={`text-xs px-1 py-1 ${scoreItem.score ? quality.badge(scoreItem.score) : ''}`}>
                              {scoreItem.score ?? 'No score'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reviewCard.expert.comments.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Comments:</div>
                      <div className="space-y-2">
                        {reviewCard.expert.comments.map((comment, idx) => (
                          <div key={idx} className="bg-muted/20 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm">"{comment.content}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'menopause', label: 'Menopause' },
    { value: 'perimenopause', label: 'Perimenopause' },
    { value: 'general_health', label: 'General Health' }
  ];

  // Claims are now filtered and sorted by the database query
    // Only show claim 913322f9-6d96-49fa-ace9-9587e8952a80 if running on localhost
    let filteredAndSortedClaims = claims;
    const specialClaimId = '913322f9-6d96-49fa-ace9-9587e8952a80';
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      // On localhost, show all claims
      filteredAndSortedClaims = claims;
    } else {
      // On production, filter out the special claim
      filteredAndSortedClaims = claims.filter(c => c.id !== specialClaimId);
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h1 className="text-5xl font-bold mb-6 pb-2 leading-[1.15] overflow-visible bg-hero-gradient bg-clip-text text-transparent">
              Health Claims
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Community-driven claims about products and services for women's health conditions.
              Upvote Claims with strong scientific backing to prioritize them for expert review.
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="claims" className="max-w-4xl mx-auto">
            {/* <TabsList className="grid w-full grid-cols-2 mb-8"> */}
              {/* <TabsTrigger value="claims">Claims</TabsTrigger> */}
              {/* <TabsTrigger value="trusted-resources">Trusted Resources</TabsTrigger> */}
            {/* </TabsList> */}

            {/* Claims Tab */}
            <TabsContent value="claims" className="space-y-6">
              {/* Claims Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>All Claims must be linked to scientific publications</span>
                </div> */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2" disabled={!user}>
                        <Plus className="w-4 h-4" />
                        {user ? 'New Claim' : 'Sign in to Submit Claim'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogTitle>Submit a new claim</DialogTitle>
                      <ClaimSubmissionForm
                        onSuccess={() => {
                          setShowSubmissionForm(false);
                          // Refresh the claims data by re-running the fetch
                          fetchData(currentPage);
                        }}
                        onCancel={() => setShowSubmissionForm(false)}
                      />
                    </DialogContent>
                  </Dialog>

                  <Select value={filterByCategory} onValueChange={(value) => setFilterByCategory(value as typeof filterByCategory)}>
                    <SelectTrigger className="w-[180px] h-9">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={sortBy === 'votes' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('votes')}
                  >
                    Sort by Votes
                  </Button>
                  <Button
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('recent')}
                  >
                    Most Recent
                  </Button>
                </div>
              </div>
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Loading claims...
                  </div>
                </div>
              )}

              {!user && !loading && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="bg-card/60 backdrop-blur-sm rounded-lg p-8 border border-border shadow-lg">
                      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                      <p className="text-muted-foreground mb-6">
                        Please sign in to view community-reviewed health claims and expert insights.
                      </p>
                      <div className="space-y-3">
                        <Button asChild className="w-full">
                          <a href="/auth" className="flex items-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Sign In
                          </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Join our community of health enthusiasts and experts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user && filteredAndSortedClaims.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No claims found for the selected category.</p>
                </div>
              )}
              {user && filteredAndSortedClaims.map((claim) => (
              <Card key={claim.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  {/* First row: Category/Status badges and vote button */}
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getCategoryColor(claim.category)} pointer-events-none transition-none`}>
                        {humanize(claim.category)}
                      </Badge>
                      {(
                        // Allow experts/researchers to request a status toggle between proposed <-> under review
                        isExpert && (claim.rawStatus === 'proposed' || claim.rawStatus === 'under review')
                      ) ? (
                        <button
                          onClick={() => {
                            // open confirmation dialog instead of toggling immediately
                            setConfirmToggleClaimId(claim.id);
                            setConfirmToggleRawStatus(claim.rawStatus || null);
                          }}
                          className="inline-flex items-center"
                          aria-label={`Toggle status for claim ${claim.id}`}
                          disabled={updatingStatus === claim.id}
                        >
                          <Badge className={getStatusColor(claim.status)} >
                            {updatingStatus === claim.id ? 'Updating...' : claim.status.replace('_', ' ')}
                          </Badge>
                        </button>
                      ) : (
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant={userVotes.has(claim.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(claim.id)}
                      className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground flex-shrink-0 text-xs px-2 py-1 h-7"
                      disabled={!user}
                    >
                      <ChevronUp className="w-3 h-3" />
                      {claim.votes}
                    </Button>
                  </div>

                  {/* Second row: Claim title */}
                  <div className="cursor-pointer" onClick={() => toggleClaimExpansion(claim.id)}>
                    <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">
                      {claim.claim}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {expandedClaim === claim.id ? '▼' : '▶'}
                      </span>
                    </CardTitle>
                  </div>
                  <ClaimLinksSection links={claim.links} />
                  {/* Aggregated Category Labels from all expert reviews, separated by stance */}
                  <div className="flex-col mt-2">
                    {(() => {
                      // Use the aggregation helper to compute counts and reasons
                      const agg = aggregateLabelsForClaim(claim);
                      const {
                        classificationOrder,
                        supportingLabelCounts,
                        contradictingLabelCounts,
                        supportingWomenNotIncluded,
                        contradictingWomenNotIncluded,
                        aggregatedReasons
                      } = agg;

                      // Build two columns: left for contradicting, right for supporting

                      return (
                        <div className="grid grid-cols-2 gap-4 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div title="Contradicting evidence">{getStanceIcon('contradicting')}</div>
                              <span className="font-semibold text-xs">Contradicting Papers</span>
                            </div>
                            {/* Use a normal div, not flex-col, so children do not stretch */}
                            <div>
                              <ClaimLabelsStack
                                classificationOrder={classificationOrder}
                                labelCounts={contradictingLabelCounts}
                                womenNotIncludedCount={contradictingWomenNotIncluded}
                                stance="contradicting"
                                aggregatedReasonsForStance={aggregatedReasons.contradicting}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div title="Supporting evidence">{getStanceIcon('supporting')}</div>
                              <span className="font-semibold text-xs">Supporting Papers</span>
                            </div>
                            <div>
                              <ClaimLabelsStack
                                classificationOrder={classificationOrder}
                                labelCounts={supportingLabelCounts}
                                womenNotIncludedCount={supportingWomenNotIncluded}
                                stance="supporting"
                                aggregatedReasonsForStance={aggregatedReasons.supporting}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </CardHeader>
                {/* Expanded view with individual reviews (moved to component) */}
                {expandedClaim === claim.id && (
                  <ClaimPublicationsExpanded
                    publications={claim.publications}
                    isExpert={isExpert}
                    user={user}
                    setReviewPublication={setReviewPublication}
                    getStanceIcon={getStanceIcon}
                  />
                )}

                {/* Bottom section with Review Reel and Add Paper buttons */}
                <CardContent className="pt-2">
                  {user && (
                    <div className="border-t border-border pt-3">
                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowReelClaim(claim.id)}
                          className="flex items-center gap-2 shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          Review Reel
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPaperForm(claim.id)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Add Paper
                        </Button>
                              {(
                                // Allow adding sources when: user is expert/researcher (isExpert) OR user is the claim owner
                                // AND the underlying DB status is exactly 'proposed'. We expose rawStatus on the mapped claim.
                                user && (isExpert || (user.id === claim.user_id && claim.rawStatus === 'proposed'))
                              ) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setShowSourceForm(claim.id);
                                    // prefill some fields if desired
                                    setSourceUrl('');
                                    setSourceTitle('');
                                    setSourceDescription('');
                                    setSourceType('webpage');
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Link className="w-4 h-4" />
                                  Add Source
                                </Button>
                              )}
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* ReelsCarousel for expert reviews - moved to dialog. Do not render inline when card is expanded. */}
                {/* The full review reel is available via the 'See Full Review' button which opens the dialog. */}
              </Card>
            ))}

            {/* Pagination Controls */}
            {user && totalClaims > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 p-4 bg-card/30 rounded-lg border">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * CLAIMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * CLAIMS_PER_PAGE, totalClaims)} of {totalClaims} claims
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || loading}
                    className="min-w-[80px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      'Previous'
                    )}
                  </Button>
                  <div className="px-3 py-1 text-sm bg-background rounded border min-w-[100px] text-center">
                    Page {currentPage + 1} of {Math.ceil(totalClaims / CLAIMS_PER_PAGE)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasMoreClaims || loading}
                    className="min-w-[80px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      'Next'
                    )}
                  </Button>
                </div>
              </div>
            )}
            </TabsContent>

            {/* <TabsContent value="trusted-resources" className="space-y-6">
              <ResourcesSection />
            </TabsContent> */}
          </Tabs>

          {/* Paper Submission Dialog */}
          {user && showPaperForm && (
            <Dialog open={!!showPaperForm} onOpenChange={() => setShowPaperForm(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {(() => {
                  const claim = filteredAndSortedClaims.find(c => c.id === showPaperForm);
                  return claim ? (
                    <div>
                      <DialogTitle>Add paper</DialogTitle>
                      <PaperSubmissionForm
                        claimId={claim.id}
                        claimTitle={claim.claim}
                        onSuccess={() => {
                          setShowPaperForm(null);
                          fetchData(currentPage);
                        }}
                        onCancel={() => setShowPaperForm(null)}
                      />
                    </div>
                  ) : null;
                })()}
              </DialogContent>
            </Dialog>
          )}

          {/* Source Submission Dialog */}
          {user && showSourceForm && (
            <Dialog open={!!showSourceForm} onOpenChange={() => setShowSourceForm(null)}>
              <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                {(() => {
                  const claim = filteredAndSortedClaims.find(c => c.id === showSourceForm);
                  if (!claim) return null;

                  const submitSource = async () => {
                    const normalized = normalizeUrl(sourceUrl);
                    if (!normalized) {
                      toast({ title: 'Invalid URL', description: 'Please enter a valid URL before saving.', variant: 'destructive' });
                      return;
                    }

                    setSourceSubmitting(true);
                    try {
                      const payload = {
                        claim_id: claim.id,
                        expert_user_id: user.id,
                        title: sourceTitle || null,
                        url: normalized,
                        description: sourceDescription || null,
                        link_type: sourceType || 'webpage'
                      };

                      const { error } = await sb.from('claim_links').insert(payload);
                      if (error) {
                        throw error;
                      }

                      // Refresh claims list
                      await fetchData(currentPage);
                      setShowSourceForm(null);
                      toast({ title: 'Source added', description: 'Your source was added successfully.' });
                    } catch (e: unknown) {
                      console.error('Error adding source link:', e);
                      const message = e instanceof Error ? e.message : 'Failed to add source.';
                      toast({ title: 'Add Source Failed', description: message, variant: 'destructive' });
                    } finally {
                      setSourceSubmitting(false);
                    }
                  };

                  return (
                    <div>
                      <DialogTitle>Add Source to claim</DialogTitle>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">URL</label>
                          <Input value={sourceUrl} onChange={(e) => setSourceUrl((e.target as HTMLInputElement).value)} placeholder="https://..." />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Title (optional)</label>
                          <Input value={sourceTitle} onChange={(e) => setSourceTitle((e.target as HTMLInputElement).value)} placeholder="Optional title" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Description (optional)</label>
                          <Textarea value={sourceDescription} onChange={(e) => setSourceDescription((e.target as HTMLTextAreaElement).value)} placeholder="Short description" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setShowSourceForm(null)}>Cancel</Button>
                          <Button size="sm" onClick={submitSource} disabled={!sourceUrl || sourceSubmitting}>
                            {sourceSubmitting ? 'Saving...' : 'Save Source'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </DialogContent>
            </Dialog>
          )}

          {/* Confirmation Dialog for toggling claim status */}
          {user && (
            <Dialog open={!!confirmToggleClaimId} onOpenChange={(open) => { if (!open) { setConfirmToggleClaimId(null); setConfirmToggleRawStatus(null); } }}>
              <DialogContent className="max-w-md">
                <DialogTitle>Confirm status change</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {`Are you sure you want to change the status from "${confirmToggleRawStatus ? confirmToggleRawStatus.replace('_', ' ') : ''}" to "${confirmToggleRawStatus === 'proposed' ? 'under review' : 'proposed'}"?`}
                </p>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => { setConfirmToggleClaimId(null); setConfirmToggleRawStatus(null); }}>Cancel</Button>
                  <Button size="sm" onClick={confirmAndToggle} disabled={updatingStatus === confirmToggleClaimId}>
                    {updatingStatus === confirmToggleClaimId ? 'Updating...' : 'Confirm'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Expert Reviews Reel Dialog */}
          {user && (
            <Dialog open={!!showReelClaim} onOpenChange={() => setShowReelClaim(null)}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                {(() => {
                  const claim = filteredAndSortedClaims.find(c => c.id === showReelClaim);
                  if (!claim) return <div className="text-center text-sm text-muted-foreground">No reviews available.</div>;

                  // Create individual cards for each expert review on each publication
                  const reviewCards: ExpertReviewCard[] = [];

                  claim.publications.forEach(pub => {
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
                      const expertComments = claimCommentsForClaim.filter(comment => comment.expert_user_id === expertUserId);

                      // For consolidated schema, pick the latest row for this expert (there should be one)
                      const latestRow = (scores || []).reduce((a, b) => {
                        const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
                        const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
                        return bTime >= aTime ? b : a;
                      }, scores[0]);

                      // Exclude 'interpretation' (Evidence Quality) from per-publication score lists — it's shown as a card-level label
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
                      if (latestRow?.comments) mergedComments.push({ content: latestRow.comments, created_at: latestRow.updated_at || latestRow.created_at || '' });
                      // if (latestRow?.evidence_classification) mergedComments.push({ content: `Classification: ${latestRow.evidence_classification}`, created_at: latestRow.updated_at || latestRow.created_at || '' });

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
                          reviewData: latestRow?.review_data ?? null
                        }
                      });
                    });
                  });

                  return (
                    <div>
                      <DialogTitle>{claim.claim} — Individual Expert Reviews</DialogTitle>
                      <ExpertReviewsReel reviewCards={reviewCards} />
                    </div>
                  );
                })()}
              </DialogContent>
            </Dialog>
          )}

          {/* Publication Review Dialog */}
          {user && (
            <PublicationReviewForm
              publication={reviewPublication}
              isOpen={!!reviewPublication}
              onClose={() => setReviewPublication(null)}
              onReviewSubmitted={() => {
                // refresh claims and expert distributions after an expert submits/updates a review
                fetchData(currentPage);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Claims;
