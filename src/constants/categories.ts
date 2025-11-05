/**
 * Shared category options for health claims
 * Used across forms and filtering throughout the application
 */
export const CLAIM_CATEGORIES = [
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'menopause', label: 'Menopause' },
  { value: 'perimenopause', label: 'Perimenopause' },
  { value: 'general_health', label: 'General Health' },
] as const;

/**
 * Category options with 'All Categories' option for filtering
 */
export const CLAIM_CATEGORIES_WITH_ALL = [
  { value: 'all', label: 'All Categories' },
  ...CLAIM_CATEGORIES,
] as const;
