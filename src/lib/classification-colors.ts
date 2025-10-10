/**
 * Get Tailwind CSS classes for evidence classification colors
 * Used consistently across Claims page and PublicationReviewForm
 */
export const getEvidenceClassificationColor = (classification: string) => {
  // Color map for evidence classifications (all lowercase, no extra spaces)
  const classificationColors: Record<string, string> = {
    'unreliable': 'bg-gray-200 text-gray-700',
    'invalid': 'bg-gray-200 text-gray-700',
    'fallacy': 'bg-orange-200 text-gray-700',
    'not tested in humans': 'bg-gray-300 text-grey-700',
    'limited tested in humans': 'bg-blue-100 text-blue-800',
    'tested in humans': 'bg-teal-300 text-gray-700 ',
    'tested in human': 'bg-green-600 text-gray-200', // Handle singular form
    'widely tested in humans': 'bg-green-300 text-green-900',
  };
  // Normalize label for color matching: lowercase and single spaces
  const key = classification.trim().toLowerCase().replace(/\s+/g, ' ');
  return classificationColors[key] || 'bg-gray-100 text-gray-800';
};