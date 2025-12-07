import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, ExternalLink } from 'lucide-react';
import { aggregatePublicationReviewData } from '@/lib/label-aggregation';
import { getCategoryBackgroundColor, getStudyTagColor, getCategoryDescription, getStudyTagDescription } from '@/lib/classification-categories';
import ClaimLinksSection from './ClaimLinksSection';
import type { PublicationScoreRow } from '../types';
import type { ReviewCategory } from '@/types/review';

type Publication = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  source?: string | null;
  stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
  rawScores?: PublicationScoreRow[];
};

type LinkRow = {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
};

const ClaimPublicationsExpanded: React.FC<{
  publications: Publication[];
  links?: LinkRow[];
  isExpert: boolean;
  user: { id?: string; role?: string } | null;
  setReviewPublication: (p: { id: string; title: string; journal: string; publication_year: number; authors?: string; url?: string; existingReview?: PublicationScoreRow | null } | null) => void;
  getStanceIcon: (stance: Publication['stance']) => React.ReactNode;
}> = ({ publications, links, isExpert, user, setReviewPublication, getStanceIcon }) => {
  return (
    <CardContent className="pt-0">
      <div className="border-t border-border pt-2">
        {/* Links Section */}
        {links && links.length > 0 && (
          <div className="mb-4 flex justify-end">
            <ClaimLinksSection links={links} />
          </div>
        )}

        <div className="space-y-4">
          {publications.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No papers yet for this stance
            </div>
          ) : (
            publications.map((pub, pubIndex) => {
            const agg = aggregatePublicationReviewData({ rawScores: pub.rawScores });
            return (
              <div key={pubIndex} className="bg-muted/20 rounded-md p-3">
                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-3">
                    {getStanceIcon(pub.stance)}
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">
                        {pub.title}
                        {pub.url && (
                          <a
                            href={pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open paper in new tab"
                            className="inline-flex items-center ml-2 text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pub.authors} • {pub.journal} ({pub.year})
                        {pub.source && (
                          <>
                            {' • '}
                            <a
                              href={pub.source}
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
                      {/* Labels: inline on desktop, stacked on mobile */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-1.5">
                        {Object.entries(agg.classificationCounts).map(([label, count]) => (
                          <Popover key={label}>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-lg ${getCategoryBackgroundColor(label)} px-2 sm:px-3 py-1 text-xs font-semibold overflow-hidden cursor-pointer`}>
                                <span className="break-words">{label}</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({count})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              <div className="font-semibold mb-1">{label}</div>
                              <div>{getCategoryDescription(label as ReviewCategory)}</div>
                            </PopoverContent>
                          </Popover>
                        ))}
                        {agg.womenNotIncludedCount > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('women_not_included')} overflow-hidden cursor-pointer`}>
                                <span className="break-words">Women Not Included</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({agg.womenNotIncludedCount})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              {getStudyTagDescription('Women Not Included')}
                            </PopoverContent>
                          </Popover>
                        )}
                        {agg.observationalCount > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('observational')} overflow-hidden cursor-pointer`}>
                                <span className="break-words">Observational</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({agg.observationalCount})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              {getStudyTagDescription('Observational')}
                            </PopoverContent>
                          </Popover>
                        )}
                        {agg.clinicalTrialCount > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`mb-1 w-full sm:inline-flex sm:w-auto items-center rounded-xl px-2 sm:px-3 py-1 text-xs font-semibold ${getStudyTagColor('clinical trial')} overflow-hidden cursor-pointer`}>
                                <span className="break-words">Clinical Trial</span>
                                <span className="ml-1 sm:ml-2 flex-shrink-0">({agg.clinicalTrialCount})</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-xs text-xs p-2">
                              {getStudyTagDescription('Clinical Trial')}
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {(isExpert || user?.role === 'admin' || user?.role === 'researcher') && (() => {
                      const existingReview = pub.rawScores?.find(rs => rs.expert_user_id === user?.id) || null;
                      const reviewButtonText = existingReview ? 'Update' : 'Review';
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewPublication({
                            id: pub.id || '',
                            title: pub.title,
                            journal: pub.journal,
                            publication_year: pub.year,
                            authors: pub.authors,
                            url: pub.url,
                            existingReview
                          })}
                          className="text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          {reviewButtonText}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </CardContent>
  );
};

export default ClaimPublicationsExpanded;
