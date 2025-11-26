/**
 * Constants for Claims page
 */

export const CLAIMS_PER_PAGE = 5;

export const SPECIAL_CLAIM_ID = '913322f9-6d96-49fa-ace9-9587e8952a80';

export const CLAIM_STATUS = {
  PROPOSED: 'proposed',
  UNDER_REVIEW: 'under review',
  APPROVED: 'approved',
  PENDING: 'pending'
} as const;

export type ClaimStatus = typeof CLAIM_STATUS[keyof typeof CLAIM_STATUS];

export const SEARCH_DEBOUNCE_MS = 300;
