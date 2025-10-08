// Type definitions for the publication review data structure

export type ReviewCategory = 
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
  representation: ReviewAnswer; // Do the people in the study represent the kinds of people the claim is about?
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
    isValid: boolean; // computed field based on the above
  };
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
    representation: 'NA',
    controlGroup: 'NA',
    biasAddressed: 'NA',
    statistics: 'NA'
  },
  validation: {
    hasConflictOfInterest: false,
    isReview: false,
    isCategoricalMetaAnalysis: false,
    isValid: true // Default to valid unless validation flags are set
  }
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
  'Black/African American',
  'Hispanic/Latino',
  'Asian',
  'Native American/Indigenous',
  'Pacific Islander',
  'Middle Eastern/North African',
  'Mixed/Multiple',
  'Not specified'
];
