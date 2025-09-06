import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users } from 'lucide-react';

interface ScoreDistribution {
  category: string;
  categoryLabel: string;
  totalExperts: number;
  distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

interface ExpertScoreDistributionProps {
  distributions: ScoreDistribution[];
}

const ExpertScoreDistribution = ({ distributions }: ExpertScoreDistributionProps) => {
  if (distributions.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Users className="w-3 h-3" />
        <span>No expert reviews yet</span>
      </div>
    );
  }

  const getAgreementLevel = (dist: ScoreDistribution['distribution'], total: number) => {
    if (total === 0) return { level: 'none', color: 'bg-gray-200' };
    
    const maxScore = Math.max(dist.low, dist.medium, dist.high);
    const agreement = maxScore / total;
    
    if (agreement >= 0.8) return { level: 'high', color: 'bg-green-200' };
    if (agreement >= 0.6) return { level: 'medium', color: 'bg-yellow-200' };
    return { level: 'low', color: 'bg-red-200' };
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Expert Reviews</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {distributions.map((dist) => {
          const agreement = getAgreementLevel(dist.distribution, dist.totalExperts);
          
          return (
            <Popover key={dist.category}>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{dist.categoryLabel}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                      {dist.totalExperts}
                    </Badge>
                  </div>
                  
                  {/* Mini stacked progress bar */}
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                    {dist.totalExperts > 0 ? (
                      <>
                        {dist.distribution.low > 0 && (
                          <div 
                            className="bg-red-400 transition-all"
                            style={{ width: `${(dist.distribution.low / dist.totalExperts) * 100}%` }}
                          />
                        )}
                        {dist.distribution.medium > 0 && (
                          <div 
                            className="bg-yellow-400 transition-all"
                            style={{ width: `${(dist.distribution.medium / dist.totalExperts) * 100}%` }}
                          />
                        )}
                        {dist.distribution.high > 0 && (
                          <div 
                            className="bg-green-400 transition-all"
                            style={{ width: `${(dist.distribution.high / dist.totalExperts) * 100}%` }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  
                  {/* Agreement indicator */}
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${agreement.color}`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {agreement.level} agreement
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              
              <PopoverContent className="w-64 text-sm">
                <div className="space-y-3">
                  <div className="font-medium">{dist.categoryLabel} Reviews</div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {dist.totalExperts} expert{dist.totalExperts !== 1 ? 's' : ''} reviewed this aspect
                    </div>
                    
                    <div className="space-y-1">
                      {dist.distribution.high > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded" />
                            <span>High Score</span>
                          </div>
                          <span className="font-medium">{dist.distribution.high}</span>
                        </div>
                      )}
                      
                      {dist.distribution.medium > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded" />
                            <span>Medium Score</span>
                          </div>
                          <span className="font-medium">{dist.distribution.medium}</span>
                        </div>
                      )}
                      
                      {dist.distribution.low > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded" />
                            <span>Low Score</span>
                          </div>
                          <span className="font-medium">{dist.distribution.low}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <strong>Agreement Level:</strong> {agreement.level === 'high' ? 'Experts mostly agree' : agreement.level === 'medium' ? 'Some disagreement among experts' : 'Significant disagreement among experts'}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};

export default ExpertScoreDistribution;