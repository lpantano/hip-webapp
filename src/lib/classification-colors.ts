/**
 * Get Tailwind CSS classes for evidence classification colors
 * Used consistently across Claims page and PublicationReviewForm
 *
 * @deprecated Use getCategoryBackgroundColor from classification-categories.ts instead
 */

import { getCategoryBackgroundColor, getCategoryBorderColor } from './classification-categories';

export const getEvidenceClassificationColor = getCategoryBackgroundColor;

export const getEvidenceClassificationBorder = getCategoryBorderColor;
