/**
 * Claim label options
 * Labels describe what the claim is about (topic/subject matter)
 * Multiple labels can be applied to a single claim
 * Labels are more granular than categories and allow for better discoverability
 */
export const CLAIM_LABELS = [
  // Reproductive & Lifecycle
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'fertility', label: 'Fertility' },
  { value: 'contraception', label: 'Contraception' },
  { value: 'menstruation', label: 'Menstruation' },
  { value: 'perimenopause', label: 'Perimenopause' },
  { value: 'menopause', label: 'Menopause' },
  { value: 'postmenopause', label: 'Postmenopause' },
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'sexual-health', label: 'Sexual Health' },
  { value: 'pelvic-floor', label: 'Pelvic Floor' },

  // Nutrition & Diet
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'diet', label: 'Diet' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'hydration', label: 'Hydration' },

  // Physical Health & Fitness
  { value: 'fitness', label: 'Fitness' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'weight-management', label: 'Weight Management' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'energy', label: 'Energy' },

  // Body Systems
  { value: 'bone-health', label: 'Bone Health' },
  { value: 'heart-health', label: 'Heart Health' },
  { value: 'hormone-health', label: 'Hormone Health' },
  { value: 'thyroid', label: 'Thyroid' },
  { value: 'gut-health', label: 'Gut Health' },
  { value: 'skin-health', label: 'Skin Health' },
  { value: 'immunity', label: 'Immunity' },
  { value: 'inflammation', label: 'Inflammation' },

  // Mental & Cognitive Health
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'cognitive-health', label: 'Cognitive Health' },
  { value: 'stress', label: 'Stress' },
  { value: 'mood', label: 'Mood' },
  { value: 'anxiety', label: 'Anxiety' },

  // General
  { value: 'general-health', label: 'General Health' },
  { value: 'chronic-pain', label: 'Chronic Pain' },
  { value: 'aging', label: 'Aging' },
] as const;

/**
 * Extract label values as a type
 */
export type ClaimLabelValue = typeof CLAIM_LABELS[number]['value'];

/**
 * Get label display text from value
 */
export const getLabelDisplay = (value: string): string => {
  const label = CLAIM_LABELS.find(l => l.value === value);
  return label?.label || value;
};
