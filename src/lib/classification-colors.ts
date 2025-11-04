/**
 * Shared color mapping for evidence classifications
 * Format: { background-color, text-color }
 */
const CLASSIFICATION_COLORS: Record<string, { bg: string; text: string }> = {
  'unreliable': { bg: 'gray-200', text: 'gray-700' },
  'invalid': { bg: 'gray-200', text: 'gray-700' },
  'fallacy': { bg: 'orange-200', text: 'gray-700' },
  'not tested in humans': { bg: 'yellow-300', text: 'yellow-700' },
  'limited tested in humans': { bg: 'blue-200', text: 'blue-800' },
  'tested in humans': { bg: 'teal-300', text: 'gray-700' },
  'tested in human': { bg: 'teal-300', text: 'gray-200' }, // Handle singular form
  'widely tested in humans': { bg: 'green-300', text: 'green-900' },
};

/**
 * Default colors for unknown classifications
 */
const DEFAULT_COLORS = { bg: 'gray-100', text: 'gray-800' };

/**
 * Normalize classification label for color matching
 */
const normalizeClassification = (classification: string): string => {
  return classification.trim().toLowerCase().replace(/\s+/g, ' ');
};

/**
 * Get Tailwind CSS classes for evidence classification colors (background variant)
 * Used consistently across Claims page and PublicationReviewForm
 */
export const getEvidenceClassificationColor = (classification: string) => {
  const key = normalizeClassification(classification);
  const colors = CLASSIFICATION_COLORS[key] || DEFAULT_COLORS;
  return `bg-${colors.bg} text-${colors.text}`;
};

/**
 * Get Tailwind CSS classes for evidence classification colors (border variant)
 * Used consistently across Claims page and PublicationReviewForm
 */
export const getEvidenceClassificationBorder = (classification: string) => {
  const key = normalizeClassification(classification);
  const colors = CLASSIFICATION_COLORS[key] || DEFAULT_COLORS;
  return `border-${colors.bg} text-${colors.text}`;
};