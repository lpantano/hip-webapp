export interface BadgeLevel {
  level: string;
  emoji: string;
  description: string;
  minContributions: number;
  maxContributions: number | null; // null means unlimited
}

export const BADGE_LEVELS: BadgeLevel[] = [
  {
    level: 'Seedling',
    emoji: '🌱',
    description: 'New Contributor',
    minContributions: 0,
    maxContributions: 50,
  },
  {
    level: 'Explorer',
    emoji: '🔬',
    description: 'Intermediate Contributor',
    minContributions: 51,
    maxContributions: 150,
  },
  {
    level: 'Navigator',
    emoji: '🧭',
    description: 'Trusted Contributor',
    minContributions: 151,
    maxContributions: 300,
  },
  {
    level: 'Architect',
    emoji: '🏛️',
    description: 'Advanced Contributor',
    minContributions: 301,
    maxContributions: 500,
  },
  {
    level: 'Luminary',
    emoji: '🌟',
    description: 'Top Contributor',
    minContributions: 501,
    maxContributions: null,
  },
];

export const CONTRIBUTION_TYPES = [
  { key: 'publication_reviews', label: 'Publication Reviews', icon: 'FileText' },
  { key: 'new_claims', label: 'Claims Submitted', icon: 'MessageSquare' },
  { key: 'links_added', label: 'Papers Added', icon: 'Link' },
] as const;

export type ContributionTypeKey = typeof CONTRIBUTION_TYPES[number]['key'];

export const getBadgeByLevel = (level: string): BadgeLevel => {
  return BADGE_LEVELS.find(b => b.level === level) || BADGE_LEVELS[0];
};

export const getBadgeByContributions = (contributions: number): BadgeLevel => {
  // Find the highest badge level the user qualifies for
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (contributions >= BADGE_LEVELS[i].minContributions) {
      return BADGE_LEVELS[i];
    }
  }
  return BADGE_LEVELS[0];
};

export const getNextBadgeLevel = (currentLevel: string): BadgeLevel | null => {
  const currentIndex = BADGE_LEVELS.findIndex(b => b.level === currentLevel);
  if (currentIndex === -1 || currentIndex === BADGE_LEVELS.length - 1) {
    return null; // Already at max level or level not found
  }
  return BADGE_LEVELS[currentIndex + 1];
};

export const getProgressToNextLevel = (
  currentLevel: string,
  totalContributions: number
): { progress: number; remaining: number; nextLevel: BadgeLevel | null } => {
  const nextLevel = getNextBadgeLevel(currentLevel);
  
  if (!nextLevel) {
    return { progress: 100, remaining: 0, nextLevel: null };
  }

  const currentBadge = getBadgeByLevel(currentLevel);
  const rangeStart = currentBadge.minContributions;
  const rangeEnd = nextLevel.minContributions;
  const rangeSize = rangeEnd - rangeStart;
  const progressInRange = totalContributions - rangeStart;
  const progress = Math.min(100, Math.round((progressInRange / rangeSize) * 100));
  const remaining = Math.max(0, rangeEnd - totalContributions);

  return { progress, remaining, nextLevel };
};
