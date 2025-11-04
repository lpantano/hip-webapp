// Type definitions for the publication review data structure

export type ReviewCategory = 
  | 'Fallacy'
  | 'Invalid'
  | 'Unreliable'
  | 'Not Tested in Humans'
  | 'Limited Tested in Humans'
  | 'Tested in Humans'
  | 'Widely Tested in Humans';

export type ReviewAnswer = 'PASS' | 'NO' | 'NA';

export interface ReviewTags {
  testedInHuman: boolean;
  ethnicityLabels: string[];
  ageRanges: string[]; // e.g., "20-29", "30-39", etc.
}

export interface ReviewQualityChecks {
  studyDesign: ReviewAnswer; // Was the study designed to answer this claim?
  controlGroup: ReviewAnswer; // Was there a proper control group?
  biasAddressed: ReviewAnswer; // Were confounding variables identified and tracked?
  statistics: ReviewAnswer; // Were statistical tests appropriate?
}

export interface ReviewData {
  category: ReviewCategory;
  tags: ReviewTags;
  qualityChecks: ReviewQualityChecks;
  validation: {
    hasConflictOfInterest: boolean;
    isReview: boolean;
    isCategoricalMetaAnalysis: boolean;
    overstatesEvidence: boolean;
    isValid: boolean; // computed field based on the above
  };
  systemUsed: {
    cells: boolean;
    animals: boolean;
    humans: boolean;
  };
  studySize: 'less_than_100' | 'less_than_500k' | 'more_than_500k' | null;
  womenNotIncluded: boolean;
}

// Helper to create empty review data
export const createEmptyReviewData = (): ReviewData => ({
  category: 'Not Tested in Humans',
  tags: {
    testedInHuman: false,
    ethnicityLabels: [],
    ageRanges: []
  },
  qualityChecks: {
    studyDesign: 'NA',
    controlGroup: 'NA',
    biasAddressed: 'NA',
    statistics: 'NA'
  },
  validation: {
    hasConflictOfInterest: false,
    isReview: false,
    isCategoricalMetaAnalysis: false,
    overstatesEvidence: false,
    isValid: true // Default to valid unless validation flags are set
  },
  systemUsed: {
    cells: false,
    animals: false,
    humans: false
  },
  studySize: null,
  womenNotIncluded: false
});

// Age range options
export const AGE_RANGES = [
  '0-9',
  '10-19',
  '20-29',
  '30-39',
  '40-49',
  '50-59',
  '60-69',
  '70-79',
  '80+'
];

// Common ethnicity labels (can be expanded)
export const ETHNICITY_OPTIONS = [
  'White/Caucasian',
  'Black or African American',
  'Asian',
  'American Indian or Alaska Native',
  'Native Hawaiian or Pacific Islander',
  'Hispanic or Latino',
  'Ashkenazi Jewish',
  'Indigenous populations',
  'European ancestry populations'
];

// Helper function to get classification reasons for Invalid, Unreliable, or Fallacy categories
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getClassificationReasons = (data: any): string[] => {
  const reasons: string[] = [];
  
  if (!data) return reasons;
  
  // Check for Fallacy reasons
  if (data.validation?.overstatesEvidence) {
    reasons.push("Claim overstates or misinterprets the evidence");
  }
  
  // Check for Invalid reasons (excluding overstatesEvidence as it's already Fallacy)
  if (!data.validation?.overstatesEvidence) {
    if (data.validation?.hasConflictOfInterest) {
      reasons.push("Has conflict of interest");
    }
    if (data.validation?.isReview) {
      reasons.push("Is a review/meta-analysis");
    }
    if (data.validation?.isCategoricalMetaAnalysis) {
      reasons.push("Is a categorical meta-analysis");
    }
  }
  
  // Check for Unreliable reasons (quality checks)
  if (data.qualityChecks?.studyDesign === 'NO') {
    reasons.push("Poor study design");
  }
  if (data.qualityChecks?.controlGroup === 'NO') {
    reasons.push("No adequate control group");
  }
  if (data.qualityChecks?.biasAddressed === 'NO') {
    reasons.push("Bias not adequately addressed");
  }
  if (data.qualityChecks?.statistics === 'NO') {
    reasons.push("Poor statistical analysis");
  }
  
  return reasons;
};
