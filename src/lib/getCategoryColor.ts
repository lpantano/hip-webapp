import type { Database } from '@/integrations/supabase/types';

// Return a unified styling for category badges:
// - background should match the page `bg-background`
// - use a border colored with the `secondary` token
// - use the `secondary` foreground color for text
// This keeps all category badges visually consistent while highlighting the category
// via border and text rather than a filled background.
export const getCategoryColor = (_category: Database['public']['Enums']['claim_category'] | string) => {
  // Use black text on light theme and white text in dark mode for maximum contrast
  return 'bg-background border border-grey text-black dark:text-white';
};
