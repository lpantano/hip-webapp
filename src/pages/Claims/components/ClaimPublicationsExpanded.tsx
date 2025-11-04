import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';
import { aggregatePublicationReviewData } from '@/lib/label-aggregation';
import { getEvidenceClassificationColor } from '@/lib/classification-colors';
import type { PublicationScoreRow } from '../types';

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

const ClaimPublicationsExpanded: React.FC<{
  publications: Publication[];
  isExpert: boolean;
  user: { id?: string; role?: string } | null;
  setReviewPublication: (p: { id: string; title: string; journal: string; publication_year: number; authors?: string; url?: string; existingReview?: PublicationScoreRow | null } | null) => void;
  getStanceIcon: (stance: Publication['stance']) => React.ReactNode;
}> = ({ publications, isExpert, user, setReviewPublication, getStanceIcon }) => {
  return (
    <CardContent className="pt-0">
      <div className="border-t border-border pt-4">
        <div className="space-y-4">
          {publications.map((pub, pubIndex) => {
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
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>
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
                        </span>
                        <span className="flex items-center gap-1">
                          {Object.entries(agg.classificationCounts).map(([label, count]) => (
                            <Badge key={label} className={`text-xs ${getEvidenceClassificationColor(label)} pointer-events-none transition-none`}>
                              {label} ({count})
                            </Badge>
                          ))}
                          {agg.womenNotIncludedCount > 0 && (
                            <Badge className="text-xs bg-red-100 text-red-800 pointer-events-none transition-none">
                              ♀ {agg.womenNotIncludedCount}
                            </Badge>
                          )}
                        </span>
                      </p>
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
          })}
        </div>
      </div>
    </CardContent>
  );
};

export default ClaimPublicationsExpanded;
