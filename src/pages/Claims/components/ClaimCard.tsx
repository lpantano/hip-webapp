import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Plus,
  FileText,
  Link as LinkIcon,
  Pencil,
  Check,
  X,
  Info,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { aggregateLabelsForClaim } from '@/lib/label-aggregation';
import ClaimLabelsStack from './ClaimLabelsStack';
import ClaimPublicationsExpanded from './ClaimPublicationsExpanded';
import { getCategoryColor } from '@/lib/getCategoryColor';
import { getEvidenceStatusColor, getStanceIcon } from '../utils/helpers';
import { getLabelDisplay } from '@/constants/labels';
import type { ClaimUI, PublicationScoreRow } from '../types';

interface ExpertProfile {
  display_name?: string | null;
  avatar_url?: string | null;
}

interface User {
  id: string;
}

interface ClaimCardProps {
  claim: ClaimUI;
  userVotes: Set<string>;
  expertProfiles: Record<string, ExpertProfile>;
  isExpert: boolean;
  user: User | null;
  onVote: (id: string) => void;
  onStanceClick: (claimId: string, stance: 'supporting' | 'contradicting') => void;
  onTitleUpdate: (claimId: string, newTitle: string) => Promise<void>;
  onShowReel: (claimId: string) => void;
  onShowPaperForm: (claimId: string) => void;
  onShowSourceForm: (claimId: string) => void;
  onShowEvidenceInfo: (claimId: string) => void;
  expandedStance: { claimId: string; stance: 'supporting' | 'contradicting' } | null;
  editingClaimId: string | null;
  setEditingClaimId: (id: string | null) => void;
  updatingTitle: string | null;
  setReviewPublication?: (pub: { id: string; title: string; journal: string; publication_year: number; authors?: string; abstract?: string; doi?: string; url?: string; existingReview?: PublicationScoreRow | null } | null) => void;
  showShareButton?: boolean;
  onShare?: () => void;
}

export const ClaimCard = ({
  claim,
  userVotes,
  expertProfiles,
  isExpert,
  user,
  onVote,
  onStanceClick,
  onTitleUpdate,
  onShowReel,
  onShowPaperForm,
  onShowSourceForm,
  onShowEvidenceInfo,
  expandedStance,
  editingClaimId,
  setEditingClaimId,
  updatingTitle,
  setReviewPublication,
  showShareButton,
  onShare
}: ClaimCardProps) => {
  const [editedTitle, setEditedTitle] = useState('');

  // Permission check for editing claim titles
  const canEditClaim = () => {
    if (isExpert) return true;
    if (user && claim.user_id === user.id && claim.rawStatus === 'proposed') {
      return true;
    }
    return false;
  };

  const startEditing = () => {
    setEditingClaimId(claim.id);
    setEditedTitle(claim.claim);
  };

  const cancelEditing = () => {
    setEditingClaimId(null);
    setEditedTitle('');
  };

  const saveTitle = async () => {
    await onTitleUpdate(claim.id, editedTitle);
    setEditingClaimId(null);
    setEditedTitle('');
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/claims/${claim.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!', {
        description: 'Share this link to show others this claim.'
      });
    } catch (err) {
      toast.error('Failed to copy link', {
        description: 'Please copy the URL manually.'
      });
    }
  };

  return (
    <Card className="group bg-card/50 backdrop-blur-sm [@media(hover:hover)]:hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        {/* First row: Category/Status badges and vote button */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex flex-wrap gap-2">
            <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowEvidenceInfo(claim.id);
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Learn about evidence status"
                >
                  <Info className="w-4 h-4" />
                </button>

            {claim.evidence_status && (
              <div className="flex items-center gap-1">

                <Badge className={`${getEvidenceStatusColor(claim.evidence_status)} pointer-events-none transition-none`}>
                  {claim.evidence_status}
                </Badge>

              </div>
            )}
            {/* Topic Labels */}
            <Badge className={`${getCategoryColor(claim.broad_category)} pointer-events-none transition-none`}>
              {claim.broad_category}
            </Badge>
            {claim.labels && claim.labels.length > 0 && claim.labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="bg-muted/50 text-xs"
              >
                {getLabelDisplay(label)}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (showShareButton && onShare) {
                  onShare();
                } else {
                  handleShareClick();
                }
              }}
              className="h-8 px-2"
              title="Copy link to this claim"
            >
              <Share2 className="h-4 w-4 text-muted-foreground [@media(hover:hover)]:hover:text-primary" />
            </Button>
            <button
              onClick={() => onVote(claim.id)}
              disabled={!user}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all touch-manipulation ${
                userVotes.has(claim.id)
                  ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105'
                  : 'border-border hover:border-primary hover:bg-primary/5'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 transition-all ${
                userVotes.has(claim.id) ? 'fill-current' : ''
              }`} />
              <span className="font-bold text-sm min-w-[20px] text-center">
                {claim.votes}
              </span>
            </button>
          </div>
        </div>

        {/* Second row: Claim title */}
        <div className="flex items-start gap-2">
          {editingClaimId === claim.id ? (
            // Edit mode: show input and save/cancel buttons
            <div className="flex-1 flex flex-col sm:flex-row items-start gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 text-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveTitle();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEditing();
                  }
                }}
                disabled={updatingTitle === claim.id}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveTitle}
                  disabled={updatingTitle === claim.id}
                  className="h-8"
                >
                  {updatingTitle === claim.id ? (
                    'Saving...'
                  ) : (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={updatingTitle === claim.id}
                  className="h-8"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ) : (
            // View mode: show title with optional edit button
            <>
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">
                  {claim.claim}
                  <span className="ml-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>
                      {claim.publications.length === 0
                        ? 'waiting for papers'
                        : `${claim.publications.length} paper${claim.publications.length === 1 ? '' : 's'}`
                      }
                    </span>
                  </span>
                </CardTitle>
              </div>
              {canEditClaim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing();
                  }}
                  className="h-8 px-2 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity touch-manipulation"
                  title="Edit claim title"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground [@media(hover:hover)]:hover:text-foreground" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Aggregated Category Labels from all expert reviews, separated by stance */}
        <div className="flex-col mt-2">
          {(() => {
            const agg = aggregateLabelsForClaim(claim);
            const {
              classificationOrder,
              supportingLabelCounts,
              contradictingLabelCounts,
              supportingWomenNotIncluded,
              contradictingWomenNotIncluded,
              supportingObservationalCount,
              contradictingObservationalCount,
              supportingClinicalTrialCount,
              contradictingClinicalTrialCount,
              aggregatedReasons
            } = agg;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-1">
                  <div
                    className="flex items-center gap-2 mb-2 cursor-pointer [@media(hover:hover)]:hover:text-primary transition-colors touch-manipulation"
                    onClick={() => onStanceClick(claim.id, 'supporting')}
                  >
                    <span className="font-semibold text-xs">
                      Reported to Support ({claim.publications.filter(p => p.stance === 'supporting').length})
                    </span>
                    {expandedStance?.claimId === claim.id && expandedStance?.stance === 'supporting' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <ClaimLabelsStack
                      classificationOrder={classificationOrder}
                      labelCounts={supportingLabelCounts}
                      womenNotIncludedCount={supportingWomenNotIncluded}
                      observationalCount={supportingObservationalCount}
                      clinicalTrialCount={supportingClinicalTrialCount}
                      stance="supporting"
                      aggregatedReasonsForStance={aggregatedReasons.supporting}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div
                    className="flex items-center gap-2 mb-2 cursor-pointer [@media(hover:hover)]:hover:text-primary transition-colors touch-manipulation"
                    onClick={() => onStanceClick(claim.id, 'contradicting')}
                  >
                    <span className="font-semibold text-xs">
                      Reported to Disprove ({claim.publications.filter(p => p.stance === 'contradicting').length})
                    </span>
                    {expandedStance?.claimId === claim.id && expandedStance?.stance === 'contradicting' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <ClaimLabelsStack
                      classificationOrder={classificationOrder}
                      labelCounts={contradictingLabelCounts}
                      womenNotIncludedCount={contradictingWomenNotIncluded}
                      observationalCount={contradictingObservationalCount}
                      clinicalTrialCount={contradictingClinicalTrialCount}
                      stance="contradicting"
                      aggregatedReasonsForStance={aggregatedReasons.contradicting}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CardHeader>

      {/* Expanded view with individual reviews */}
      {expandedStance?.claimId === claim.id && setReviewPublication && (
        <ClaimPublicationsExpanded
          publications={claim.publications.filter(p => p.stance === expandedStance.stance)}
          links={claim.links}
          isExpert={isExpert}
          user={user}
          setReviewPublication={setReviewPublication}
          getStanceIcon={getStanceIcon}
          expertProfiles={expertProfiles}
        />
      )}

      {/* Bottom section with action buttons */}
      <CardContent className="pt-2">
        {user && (
          <div className="border-t border-border pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onShowReel(claim.id)}
                  className="flex items-center gap-2 shadow-md whitespace-nowrap touch-manipulation"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">See Comments</span>
                  <span className="sm:hidden">Comments</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowPaperForm(claim.id)}
                  className="flex items-center gap-2 whitespace-nowrap touch-manipulation"
                >
                  <FileText className="hidden sm:inline w-4 h-4" />
                  <Plus className="sm:hidden w-4 h-4" />
                  <span className="hidden sm:inline">Add Paper</span>
                  <span className="sm:hidden">Paper</span>
                </Button>
                {user && (isExpert || (user.id === claim.user_id && claim.rawStatus === 'proposed')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowSourceForm(claim.id)}
                    className="flex items-center gap-2 whitespace-nowrap touch-manipulation"
                  >
                    <LinkIcon className="hidden sm:inline w-4 h-4" />
                    <Plus className="sm:hidden w-4 h-4" />
                    <span className="hidden sm:inline">Add Source</span>
                    <span className="sm:hidden">Source</span>
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground ml-auto">
                {new Date(claim.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
