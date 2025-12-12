/**
 * Broad category options for health claims
 * Used for higher-level filtering and navigation
 */
export const BROAD_CATEGORIES = [
  { value: 'Health', label: 'Health' },
  { value: 'Wellness', label: 'Wellness' },
  { value: 'Mind', label: 'Mind' },
] as const;

/**
 * Broad category options with 'All Categories' option for filtering
 */
export const BROAD_CATEGORIES_WITH_ALL = [
  { value: 'all', label: 'All Categories' },
  ...BROAD_CATEGORIES,
] as const;

/**
 * Mapping from granular categories to broad categories
 */
export const CATEGORY_TO_BROAD_CATEGORY_MAP: Record<string, 'Health' | 'Wellness' | 'Mind'> = {
  pregnancy: 'Health',
  menopause: 'Health',
  perimenopause: 'Health',
  general_health: 'Health',
  postmenopause: 'Health',
  period: 'Health',
  fitness: 'Wellness',
  nutrition: 'Wellness',
  mental_health: 'Mind',
};

/**
 * Get broad category from granular category
 */
export const getBroadCategory = (category: string): 'Health' | 'Wellness' | 'Mind' => {
  return CATEGORY_TO_BROAD_CATEGORY_MAP[category] || 'Health';
};
