/**
 * Debug script to test claim state calculation
 * Run this with: npx tsx debug-claim-state.ts
 */

import { calculateClaimStateLabel } from '../src/lib/claim-state-calculator';

// Your claim scenario
const testClaim = {
  id: 'test-claim',
  publications: [
    {
      id: 'paper-1',
      stance: 'supporting' as const,
      rawScores: [
        {
          review_data: {
            category: 'Tested in Humans',
            studyType: {
              observational: false,
              clinicalTrial: false
            },
            womenNotIncluded: false
          }
        }
      ]
    },
    {
      id: 'paper-2',
      stance: 'supporting' as const,
      rawScores: [
        {
          review_data: {
            category: 'Inconclusive',
            studyType: {
              observational: false,
              clinicalTrial: false
            },
            womenNotIncluded: false
          }
        },
        {
          review_data: {
            category: 'Inconclusive',
            studyType: {
              observational: false,
              clinicalTrial: false
            },
            womenNotIncluded: false
          }
        }
      ]
    }
  ]
};

console.log('Testing claim state calculation...\n');
console.log('Claim data:', JSON.stringify(testClaim, null, 2));
console.log('\nCalculated state:', calculateClaimStateLabel(testClaim));
console.log('\nExpected: Evidence Supports');
