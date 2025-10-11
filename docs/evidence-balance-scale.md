# Evidence Balance Scale Implementation Guide

## Overview

This document outlines the logic for implementing an evidence balance scale that summarizes scientific publications supporting or contradicting claims. The system prioritizes human studies over animal/in-vitro research while incorporating quality assessments and gender inclusion considerations.

## Core Principles

1. **Human Study Dominance**: Human studies receive exponentially higher weight than animal/in-vitro studies
2. **Quality-Based Scoring**: Publications are scored based on methodological quality assessments
3. **Gender Inclusion Penalty**: Studies excluding women receive score penalties
4. **Evidence Classification Integration**: Uses existing classification system from expert reviews

## Current System Analysis

### Evidence Classifications (from `review_data.category`)
```
├── "Established" - Well-established evidence base (100 points)
├── "Strong" - Good evidence base (80 points)  
├── "Preliminary" - Some evidence but limited (40 points)
├── "Early" - Initial/preliminary evidence (20 points)
├── "Invalid" - Flawed/invalid studies (-50 points)
├── "Unreliable" - Unreliable methodology (-30 points)
└── "Fallacy" - Contains logical fallacies (-80 points)
```

### Quality Assessment Framework (from `review_data.qualityChecks`)
```
Quality Checks:
├── studyDesign: 'PASS' | 'NO' | 'NA'
├── representation: 'PASS' | 'NO' | 'NA'  
├── controlGroup: 'PASS' | 'NO' | 'NA'
├── biasAddressed: 'PASS' | 'NO' | 'NA'
└── statistics: 'PASS' | 'NO' | 'NA'

Study Tags (from `review_data.tags`):
├── testedInHuman: boolean
├── ethnicityLabels: string[]
└── ageRanges: string[]

Penalties:
└── womenNotIncluded: boolean (penalty flag)
```

### Publication Stance (from new `stance` column)
```
├── 'supporting' - Publication supports the claim
├── 'contradicting' - Publication contradicts the claim
├── 'neutral' - Publication is neutral/inconclusive  
└── 'mixed' - Publication has mixed evidence
```

## Scoring Algorithm

### 1. Base Evidence Weights by Classification

```javascript
function getClassificationWeight(category) {
  const weights = {
    'Established': 100,
    'Strong': 80,
    'Preliminary': 40,
    'Early': 20,
    'Invalid': -50,
    'Unreliable': -30,
    'Fallacy': -80
  };
  return weights[category] || 0;
}
```

### 2. Human Study Multiplier System

```javascript
function getHumanMultiplier(reviewData) {
  let multiplier = 1.0;
  
  if (reviewData.tags?.testedInHuman === true) {
    multiplier = 2.0; // Double weight for human studies
    
    // Apply women exclusion penalty to human studies only
    if (reviewData.womenNotIncluded === true) {
      multiplier -= 0.3; // Reduces from 2.0x to 1.7x
    }
  } else if (reviewData.tags?.testedInHuman === false) {
    multiplier = 0.5; // Half weight for non-human studies
  }
  
  return multiplier;
}
```

### 3. Quality Assessment Multiplier

```javascript
function calculateQualityMultiplier(qualityChecks) {
  let multiplier = 1.0;
  let passCount = 0;
  let totalChecks = 0;
  
  const checks = ['studyDesign', 'representation', 'controlGroup', 'biasAddressed', 'statistics'];
  
  checks.forEach(check => {
    if (qualityChecks[check]) {
      totalChecks++;
      if (qualityChecks[check] === 'PASS') {
        passCount++;
      } else if (qualityChecks[check] === 'NO') {
        passCount -= 0.5; // Penalty for failing checks
      }
      // 'NA' = neutral (0 impact)
    }
  });
  
  if (totalChecks > 0) {
    const qualityRatio = passCount / totalChecks;
    multiplier = 0.5 + (qualityRatio * 1.0); // Range: 0.5x to 1.5x
  }
  
  return Math.max(0.1, multiplier); // Minimum 0.1x multiplier
}
```

### 4. Final Publication Score Calculation

```javascript
function calculatePublicationScore(reviewData) {
  // Base weight from evidence classification
  let baseWeight = getClassificationWeight(reviewData.category);
  
  // Human testing multiplier with women exclusion penalty
  let humanMultiplier = getHumanMultiplier(reviewData);
  
  // Quality assessment multiplier
  let qualityMultiplier = calculateQualityMultiplier(reviewData.qualityChecks);
  
  return baseWeight * humanMultiplier * qualityMultiplier;
}
```

### 5. Claim Evidence Aggregation

```javascript
function calculateClaimEvidence(publications) {
  let supportingScore = 0;
  let contradictingScore = 0;
  
  publications.forEach(pub => {
    const score = calculatePublicationScore(pub.reviewData);
    
    // Apply to appropriate side based on stance
    switch(pub.stance) {
      case 'supporting':
        supportingScore += Math.max(0, score); // Only positive scores for supporting
        break;
      case 'contradicting':  
        contradictingScore += Math.max(0, Math.abs(score)); // Convert to positive for contradiction
        break;
      case 'neutral':
        // Don't add to either side
        break;
      case 'mixed':
        // Split the evidence
        const absScore = Math.abs(score);
        supportingScore += absScore * 0.5;
        contradictingScore += absScore * 0.5;
        break;
    }
  });
  
  return {
    supporting: supportingScore,
    contradicting: contradictingScore,
    netScore: supportingScore - contradictingScore,
    confidence: calculateConfidence(publications)
  };
}
```

## Human Dominance Rules

### Rule 1: Human Veto Power
```javascript
// Single contradicting human study dominates multiple animal studies
if (hasContradictingHumanStudy && onlyAnimalSupport) {
  // Human evidence veto: reduce animal evidence by 90%
  supportingScore *= 0.1;
}
```

### Rule 2: Women Exclusion Penalty Compounds
```javascript
if (humanStudyExcludesWomen && isContradicting) {
  // Extra penalty for contradicting studies that exclude women
  contradictingScore *= 1.2;
}
```

### Rule 3: Quality Threshold for Human Dominance
```javascript
if (humanStudyQuality < 0.3) { // Very low quality
  // Reduce human dominance multiplier
  humanMultiplier = Math.min(humanMultiplier, 1.5);
}
```

## Evidence Balance Scale Visualization

### Score Ranges and Interpretations
```
Balance Scale Ranges:
├── Strong Contradiction: < -200 points
├── Moderate Contradiction: -200 to -50 points  
├── Weak Contradiction: -50 to -10 points
├── Inconclusive: -10 to +10 points
├── Weak Support: +10 to +50 points
├── Moderate Support: +50 to +200 points
└── Strong Support: > +200 points
```

### Visual Representation
```
Human Study Indicators:
🧑‍⚕️ = Human studies present (with bonus)
🐭 = Only animal/in-vitro studies  
⚠️ = Mixed human evidence
♀❌ = Women excluded (penalty applied)

Quality Indicators:  
⭐⭐⭐ = High quality (most checks PASS)
⭐⭐ = Moderate quality  
⭐ = Low quality (many checks fail)
❌ = Invalid/Unreliable studies

Example Balance Scales:
🧑‍⚕️⭐⭐⭐ Contradicting ←●─────────→ Supporting  (Strong human contradiction)
🐭⭐⭐ Contradicting ←────●────→ Supporting  (Moderate animal support)
🧑‍⚕️♀❌⭐⭐ Contradicting ←──────●──→ Supporting  (Human support but women excluded)
```

### Interactive Balance Scale Component
```
Evidence Balance: Contradicting ←────●────→ Supporting
                 Strong │ Moderate │ Weak │ Inconclusive │ Weak │ Moderate │ Strong
                 -1000   -500     -100    0      +100   +500    +1000

Net Score: +245 (Moderate Support)
Confidence: High (based on human studies with good quality)
```

## Confidence Assessment

### Confidence Calculation
```javascript
function calculateConfidence(publications) {
  let confidence = 'Low';
  
  const humanStudies = publications.filter(p => p.reviewData?.tags?.testedInHuman);
  const highQualityStudies = publications.filter(p => {
    const quality = calculateQualityMultiplier(p.reviewData?.qualityChecks || {});
    return quality > 1.2;
  });
  
  if (humanStudies.length >= 2 && highQualityStudies.length >= 2) {
    confidence = 'High';
  } else if (humanStudies.length >= 1 || highQualityStudies.length >= 3) {
    confidence = 'Moderate';
  }
  
  return confidence;
}
```

## Implementation Checklist

### Database Changes Required
- [x] Add `stance` column to `publications` table (already implemented)
- [ ] Create indexes for efficient querying by stance

### Frontend Components Needed
- [ ] EvidenceBalanceScale component
- [ ] ConfidenceIndicator component  
- [ ] QualityIndicators component
- [ ] EvidenceSummaryCard component

### Backend Functions Required
- [ ] calculatePublicationScore()
- [ ] calculateClaimEvidence()
- [ ] applyHumanDominanceRules()
- [ ] generateEvidenceSummary()

### Integration Points
- [ ] Integrate with existing `mapEvidenceRowToScores()` function in Claims.tsx
- [ ] Connect to publication review form submissions
- [ ] Update claim display components
- [ ] Add evidence balance to claim cards

## Example Scenarios

### Scenario 1: Human Study Dominance
```
Publications:
- 5 animal studies supporting (5 × 20 × 0.5 = 50 points)
- 1 human RCT contradicting (100 × 2.0 × 1.3 = 260 points)

Before Dominance Rules: +50 vs -260 = -210 (Moderate Contradiction)
After Human Veto: +5 vs -260 = -255 (Strong Contradiction)
```

### Scenario 2: Women Exclusion Penalty
```
Publications:
- 1 human study supporting, women excluded (80 × 1.7 × 1.1 = 150 points)
- 1 human study contradicting, inclusive (80 × 2.0 × 1.0 = 160 points)

Result: +150 vs -160 = -10 (Inconclusive)
Note: Without women exclusion penalty, would be +169 vs -160 = +9 (Weak Support)
```

### Scenario 3: Quality Impact
```
Publications:
- 2 high-quality human RCTs supporting (2 × 100 × 2.0 × 1.4 = 560 points)
- 3 low-quality animal studies contradicting (3 × 40 × 0.5 × 0.6 = 36 points)

Result: +560 vs -36 = +524 (Strong Support)
Confidence: High (multiple high-quality human studies)
```

## Future Enhancements

### Advanced Features to Consider
1. **Time-weighted scoring**: More recent studies get higher weights
2. **Journal impact factor**: Adjust scores based on publication venue
3. **Sample size scaling**: Larger studies receive higher multipliers
4. **Geographic diversity**: Bonus for studies across different populations
5. **Replication bonus**: Studies that replicate findings get extra weight

### UI/UX Improvements
1. **Interactive tooltips**: Explain scoring methodology
2. **Drill-down capability**: Click balance scale to see contributing studies
3. **Comparison mode**: Compare evidence balance across similar claims
4. **Export functionality**: Generate evidence summary reports

## Notes for Developers

### Performance Considerations
- Cache calculated scores to avoid repeated computation
- Use database indexes for efficient filtering by stance and quality
- Consider implementing scoring calculations in PostgreSQL functions for better performance

### Testing Requirements
- Unit tests for all scoring functions
- Integration tests for balance scale component
- Edge case testing (no studies, all neutral studies, etc.)
- Performance testing with large numbers of publications

### Accessibility
- Ensure balance scale is screen reader accessible
- Provide text alternatives for visual indicators
- Support keyboard navigation for interactive elements

---

*Last Updated: October 10, 2025*
*Version: 1.0*