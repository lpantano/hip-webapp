/**
 * Claim label options organized into groups
 * Labels describe what the claim is about (topic/subject matter)
 * Multiple labels can be applied to a single claim
 * Labels are more granular than categories and allow for better discoverability
 */

export const CLAIM_LABEL_GROUPS = [
  {
    id: 'reproductive',
    name: 'Reproductive & Lifecycle',
    color: {
      selected: 'bg-teal-500 hover:bg-teal-600 text-white border-teal-500',
      unselected: 'border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-950'
    },
    labels: [
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
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition & Diet',
    color: {
      selected: 'bg-green-500 hover:bg-green-600 text-white border-green-500',
      unselected: 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950'
    },
    labels: [
      { value: 'nutrition', label: 'Nutrition' },
      { value: 'diet', label: 'Diet' },
      { value: 'supplements', label: 'Supplements' },
      { value: 'hydration', label: 'Hydration' },
    ]
  },
  {
    id: 'physical',
    name: 'Physical Health & Fitness',
    color: {
      selected: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
      unselected: 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950'
    },
    labels: [
      { value: 'fitness', label: 'Fitness' },
      { value: 'body-composition', label: 'Body Composition' },
      { value: 'exercise', label: 'Exercise' },
      { value: 'weight-management', label: 'Weight Management' },
      { value: 'sleep', label: 'Sleep' },
      { value: 'energy', label: 'Energy' },
    ]
  },
  {
    id: 'body-systems',
    name: 'Body Systems',
    color: {
      selected: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500',
      unselected: 'border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950'
    },
    labels: [
      { value: 'bone-health', label: 'Bone Health' },
      { value: 'heart-health', label: 'Heart Health' },
      { value: 'hormone-health', label: 'Hormone Health' },
      { value: 'gut-health', label: 'Gut Health' },
      { value: 'skin-health', label: 'Skin Health' },
      { value: 'immunity', label: 'Immunity' },
      { value: 'inflammation', label: 'Inflammation' },
    ]
  },
  {
    id: 'mental',
    name: 'Mental & Cognitive Health',
    color: {
      selected: 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500',
      unselected: 'border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950'
    },
    labels: [
      { value: 'mental-health', label: 'Mental Health' },
      { value: 'cognitive-health', label: 'Cognitive Health' },
      { value: 'stress', label: 'Stress' },
      { value: 'mood', label: 'Mood' },
      { value: 'anxiety', label: 'Anxiety' },
      { value: 'adhd', label: 'ADHD' },
      { value: 'autism', label: 'Autism' },
      { value: 'depression', label: 'Depression' },
    ]
  },
  {
    id: 'general',
    name: 'General',
    color: {
      selected: 'bg-slate-500 hover:bg-slate-600 text-white border-slate-500',
      unselected: 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-950'
    },
    labels: [
      { value: 'general-health', label: 'General Health' },
      { value: 'chronic-pain', label: 'Chronic Pain' },
      { value: 'aging', label: 'Aging' },
    ]
  },
] as const;

// Flat list of all labels for backward compatibility
export const CLAIM_LABELS = [
  ...CLAIM_LABEL_GROUPS[0].labels,
  ...CLAIM_LABEL_GROUPS[1].labels,
  ...CLAIM_LABEL_GROUPS[2].labels,
  ...CLAIM_LABEL_GROUPS[3].labels,
  ...CLAIM_LABEL_GROUPS[4].labels,
  ...CLAIM_LABEL_GROUPS[5].labels,
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

/**
 * Get label color classes from value
 */
export const getLabelColor = (value: string): { selected: string; unselected: string } => {
  for (const group of CLAIM_LABEL_GROUPS) {
    if (group.labels.some(l => l.value === value)) {
      return group.color;
    }
  }
  // Default color if label not found
  return {
    selected: 'bg-slate-500 hover:bg-slate-600 text-white border-slate-500',
    unselected: 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-950'
  };
};
