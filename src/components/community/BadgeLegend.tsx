import { FileText, MessageSquare, Link } from 'lucide-react';
import { BADGE_LEVELS, CONTRIBUTION_TYPES } from '@/constants/badges';

const BadgeLegend = () => {
  const getContributionIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return FileText;
      case 'MessageSquare': return MessageSquare;
      case 'Link': return Link;
      default: return FileText;
    }
  };

  const formatThreshold = (min: number, max: number | null) => {
    if (max === null) {
      return `${min}+`;
    }
    if (min === 0) {
      return `0-${max}`;
    }
    return `${min}-${max}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm mb-2">Contributor Levels</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Earn badges by contributing to the platform. Your level is based on total contributions.
        </p>
        <div className="space-y-2">
          {BADGE_LEVELS.map((badge) => (
            <div
              key={badge.level}
              className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-lime-200 text-lg">
                {badge.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{badge.level}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatThreshold(badge.minContributions, badge.maxContributions)} contributions)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-sm mb-2">What Counts as a Contribution?</h4>
        <div className="space-y-2">
          {CONTRIBUTION_TYPES.map((type) => {
            const Icon = getContributionIcon(type.icon);
            return (
              <div key={type.key} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <span>{type.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BadgeLegend;
