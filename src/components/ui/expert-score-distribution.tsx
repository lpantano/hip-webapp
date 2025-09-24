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

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Expert Reviews</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(() => {
          const anyReviewed = distributions.some(d => d.totalExperts > 0);
          return anyReviewed ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-1 py-0 h-4">Reviewed</Badge>
              <span className="text-xs text-muted-foreground">Review visualization is being updated</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No expert reviews yet</div>
          );
        })()}
      </div>
    </div>
  );
};

export default ExpertScoreDistribution;