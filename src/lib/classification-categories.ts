/**
 * Centralized configuration for evidence classification categories
 * This file contains all category definitions, colors, and explanations
 * to ensure consistency across the application.
 */

import type { ReviewCategory, TagStudy } from '@/types/review';

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
  'misinformation': 'bg-evidence-misinformation text-white',
  'invalid': 'bg-evidence-invalid text-gray-700',
  'inconclusive': 'bg-evidence-invalid text-gray-700',
  'not tested in humans': 'bg-evidence-not-tested text-grey-700',
  'limited tested in humans': 'bg-evidence-limited text-blue-800',
  'tested in humans': 'bg-evidence-tested text-white',
  // 'widely tested in humans': 'bg-green-300 text-green-900',
  'widely tested in humans': 'bg-evidence-widely-tested text-white',
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
  'tested in humans': 'border-teal-300 text-green-900',
  'widely tested in humans': 'border-green-300 text-green-900',
} as const;

// ============================================================================
// STUDY TAG COLORS
// ============================================================================
export const STUDY_TAG: readonly TagStudy[] = [
  'Women Not Included',
  'Observational',
  'Clinical Trial'
] as const;

/**
 * Background color classes for study tags (used in badges)
 */
export const STUDY_TAG_COLORS: Record<string, string> = {
  'women not included': 'bg-orange-200 text-grey-700',
  'observational': 'bg-evidence-observational text-blue-800',
  'clinical trial': 'bg-evidence-clinical text-white',
} as const;

/**
 * Border color classes for study tags (used in form buttons/chips with selected state)
 */
export const STUDY_TAG_BORDER_COLORS: Record<string, string> = {
  'women not included': 'border-pink-400',
  'observational': 'border-blue-200 text-blue-800',
  'clinical trial': 'border-green-300 text-green-900',
} as const;

/**
 * Descriptions for study tags (used by UI tooltips/help)
 */
export const STUDY_TAG_DESCRIPTIONS: Record<string, string> = {
  'Women Not Included': 'Indicates that women or female participants were not included in the study population, which limits generalizability to female populations.',
  'Observational': 'An observational study observes participants without intervening — examples include cohort, case-control, and cross-sectional designs. Limitations: cannot prove causality and is susceptible to confounding, selection bias, and measurement error.',
  'Clinical Trial': 'An experimental study where participants receive an intervention or treatment to evaluate its effectiveness and safety. Typically randomized and controlled to reduce bias when well-designed.'
} as const;

/**
 * Get a human-readable description for a study tag
 */
export function getStudyTagDescription(tag: string): string {
  return STUDY_TAG_DESCRIPTIONS[tag] || '';
}

// ============================================================================
// QUALITY CHECK DESCRIPTIONS
// ============================================================================

/**
 * Descriptions for quality check questions (used by UI tooltips/help)
 */
export const QUALITY_CHECK_DESCRIPTIONS: Record<string, string> = {
  'studyDesign': 'Was the study designed to answer this claim? The research question and methodology should directly address the claim being evaluated.',
  'controlGroup': 'Was there a proper control group? This could be wildtype, baseline, placebo, standard of care, or matched cohort depending on the study type.',
  'biasAddressed': 'Were confounding variables identified and tracked? Important factors like time, age, sex, comorbidities, and socioeconomic factors should be considered and controlled for.',
  'statistics': 'Were statistical tests appropriate for the study design and data type? The analysis should use proper methods for the research question and data structure.'
} as const;

/**
 * Get a human-readable description for a quality check
 */
export function getQualityCheckDescription(check: string): string {
  return QUALITY_CHECK_DESCRIPTIONS[check] || '';
}

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

/**
 * Get background color classes for a study tag
 */
export function getStudyTagColor(tag: string): string {
  const key = normalizeCategoryKey(tag);
  return STUDY_TAG_COLORS[key] || 'bg-gray-100 text-gray-800';
}

/**
 * Get border color classes for a study tag (used in form buttons/chips)
 */
export function getStudyTagBorderColor(tag: string): string {
  const key = normalizeCategoryKey(tag);
  return STUDY_TAG_BORDER_COLORS[key] || 'border-gray-400';
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
