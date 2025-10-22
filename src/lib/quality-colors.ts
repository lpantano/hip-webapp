import type { ReviewAnswer } from '@/types/review';

// Centralized class mappings for quality-answer UI styles.
// Keep these in one place so buttons and badges stay consistent across the app.
const quality = {
  // Classes used for small badge-like displays (e.g. in review reels)
  badge: (value?: ReviewAnswer | null) => {
    switch (value) {
      case 'PASS':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'NO':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'NA':
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },

  // Classes used for active state of choice buttons in the review form
  buttonActive: (value: ReviewAnswer) => {
    switch (value) {
      case 'PASS':
        return 'bg-green-100 text-green-800 border-green-400 shadow-sm';
      case 'NO':
        return 'bg-red-100 text-red-800 border-red-400 shadow-sm';
      case 'NA':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400 shadow-sm';
    }
  }
};

export default quality;
