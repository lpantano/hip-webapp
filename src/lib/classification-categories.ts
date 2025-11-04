/**
 * Centralized configuration for evidence classification categories
 * This file contains all category definitions, colors, and explanations
 * to ensure consistency across the application.
 */

import type { ReviewCategory } from '@/types/review';

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

/**
 * All available classification categories in priority order
 * Used in forms, labels, and aggregation logic
 */
export const CLASSIFICATION_CATEGORIES: readonly ReviewCategory[] = [
  'Misinformation',
  'Invalid',
  'Inconclusive',
  'Not Tested in Humans',
  'Limited Tested in Humans',
  'Tested in Humans',
  'Widely Tested in Humans'
] as const;

/**
 * Categories that indicate problematic evidence
 * These are shown with reasons/explanations
 */
export const PROBLEMATIC_CATEGORIES: readonly ReviewCategory[] = [
  'Misinformation',
  'Invalid',
  'Inconclusive'
] as const;

// ============================================================================
// COLOR MAPPINGS
// ============================================================================

/**
 * Background color classes for each category (used in badges)
 */
export const CATEGORY_BACKGROUND_COLORS: Record<string, string> = {
  'misinformation': 'bg-orange-200 text-gray-700',
  'invalid': 'bg-gray-200 text-gray-700',
  'inconclusive': 'bg-gray-200 text-gray-700',
  'not tested in humans': 'bg-yellow-300 text-yellow-700',
  'limited tested in humans': 'bg-blue-200 text-blue-800',
  'tested in humans': 'bg-teal-300 text-gray-700',
  'tested in human': 'bg-teal-300 text-gray-200', // singular form fallback
  'widely tested in humans': 'bg-green-300 text-green-900',
} as const;

/**
 * Border color classes for each category (used in outlined badges)
 */
export const CATEGORY_BORDER_COLORS: Record<string, string> = {
  'misinformation': 'border-orange-200 text-gray-700',
  'invalid': 'border-gray-200 text-gray-700',
  'inconclusive': 'border-gray-200 text-gray-700',
  'not tested in humans': 'border-yellow-300 text-yellow-700',
  'limited tested in humans': 'border-blue-200 text-blue-800',
  'tested in humans': 'border-teal-300 text-gray-700',
  'tested in human': 'border-teal-300 text-gray-200', // singular form fallback
  'widely tested in humans': 'border-green-300 text-green-900',
} as const;

// ============================================================================
// CATEGORY EXPLANATIONS
// ============================================================================

/**
 * Human-readable descriptions for each category
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Misinformation': 'The claim overstates what the evidence actually shows',
  'Invalid': 'The study has fundamental issues (conflict of interest, is a review/meta-analysis, etc.)',
  'Inconclusive': 'The study has quality issues in design, control group, bias handling, or statistics',
  'Not Tested in Humans': 'The study was conducted on cells, animals, or other non-human systems',
  'Limited Tested in Humans': 'The study has fewer than 100 human participants',
  'Tested in Humans': 'The study has 100-500,000 human participants',
  'Widely Tested in Humans': 'The study has more than 500,000 human participants',
} as const;

/**
 * Short labels for UI display when space is limited
 */
export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  'Misinformation': 'Misinformation',
  'Invalid': 'Invalid',
  'Inconclusive': 'Inconclusive',
  'Not Tested in Humans': 'Not in Humans',
  'Limited Tested in Humans': 'Limited Humans',
  'Tested in Humans': 'In Humans',
  'Widely Tested in Humans': 'Widely Tested',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize category string for consistent matching
 * Converts to lowercase and normalizes whitespace
 */
export function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Get background color classes for a category
 */
export function getCategoryBackgroundColor(category: string): string {
  const key = normalizeCategoryKey(category);
  return CATEGORY_BACKGROUND_COLORS[key] || 'bg-gray-100 text-gray-800';
}

/**
 * Get border color classes for a category
 */
export function getCategoryBorderColor(category: string): string {
  const key = normalizeCategoryKey(category);
  return CATEGORY_BORDER_COLORS[key] || 'border-gray-100 text-gray-800';
}

/**
 * Get human-readable description for a category
 */
export function getCategoryDescription(category: ReviewCategory): string {
  return CATEGORY_DESCRIPTIONS[category] || '';
}

/**
 * Get short label for a category
 */
export function getCategoryShortLabel(category: ReviewCategory): string {
  return CATEGORY_SHORT_LABELS[category] || category;
}

/**
 * Check if a category is problematic (needs reasons/explanations)
 */
export function isProblematicCategory(category: string): boolean {
  return PROBLEMATIC_CATEGORIES.includes(category as ReviewCategory);
}

/**
 * Check if a category represents human testing
 */
export function isHumanTestingCategory(category: string): boolean {
  const humanCategories: readonly string[] = [
    'Limited Tested in Humans',
    'Tested in Humans',
    'Widely Tested in Humans'
  ];
  return humanCategories.includes(category);
}

// ============================================================================
// CATEGORY ORDERING
// ============================================================================

/**
 * Get the priority/severity order of a category (lower = more severe)
 * Used for sorting and determining which label to show when multiple exist
 */
export function getCategoryPriority(category: string): number {
  const index = CLASSIFICATION_CATEGORIES.indexOf(category as ReviewCategory);
  return index === -1 ? 999 : index;
}

/**
 * Compare two categories by priority (for sorting)
 * Returns negative if a comes before b, positive if b comes before a
 */
export function compareCategoriesByPriority(a: string, b: string): number {
  return getCategoryPriority(a) - getCategoryPriority(b);
}
