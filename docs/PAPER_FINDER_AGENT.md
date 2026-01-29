# Paper Finder Agent

An AI-powered agent that automatically searches for, analyzes, and ranks scientific papers relevant to health claims in Evidence Decoded.

## Overview

The Paper Finder Agent:
1. Searches PubMed for papers related to a specific claim
2. Filters for peer-reviewed articles from the last 10 years
3. Prioritizes meta-analyses and clinical trials
4. Uses AI to analyze each paper's stance (supporting/contradicting/neutral)
5. Ranks papers by study design quality and relevance
6. Generates detailed markdown reports
7. Offers interactive review to add approved papers to the database

## Features

- **Automated PubMed Search**: Searches using claim title and description
- **Quality Filtering**: Only includes peer-reviewed articles
- **Study Design Scoring**: Prioritizes high-quality study types
  - Meta-Analysis (5/5)
  - Systematic Review (4/5)
  - Randomized Controlled Trial (3/5)
  - Clinical Trial (2/5)
  - Observational Study (1/5)
- **AI Stance Analysis**: Uses Claude AI to determine if papers support or contradict claims
- **Relevance Scoring**: Calculates semantic relevance to the claim
- **Comprehensive Reports**: Generates markdown files with full paper details
- **Interactive Review**: One-by-one approval process for adding to database

## Setup

### Prerequisites

1. **Anthropic API Key** (optional but recommended for better analysis)
   - Sign up at https://console.anthropic.com/
   - Add to `.env.local`:
     ```
     VITE_ANTHROPIC_API_KEY=your_api_key_here
     ```
   - Without this, the agent will use keyword-based fallback analysis

2. **Supabase Credentials** (should already be configured)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Installation

No additional installation needed - all dependencies are included in the project.

## Usage

### Basic Usage

```bash
npm run find-papers <claim-id>
```

Example:
```bash
npm run find-papers abc123-def456-ghi789
```

### Advanced Options

```bash
# Find more papers (default is 5)
npm run find-papers <claim-id> --limit 10

# Custom output directory (default is company/science/find-evidences)
npm run find-papers <claim-id> --output my-custom-folder

# Skip interactive review
npm run find-papers <claim-id> --no-review

# Combine options
npm run find-papers <claim-id> --limit 10 --output research/claim-papers
```

### Get Help

```bash
npm run find-papers --help
```

## Workflow

### 1. Search Phase
- Agent searches PubMed using claim title and description
- Filters for articles from the last 10 years
- Prioritizes meta-analyses and clinical trials
- Fetches up to 20 initial results

### 2. Analysis Phase
- Filters to peer-reviewed papers only
- Scores each paper by study design quality
- Uses AI to analyze:
  - Stance (supporting/contradicting/neutral/mixed)
  - Confidence level (0-100%)
  - Relevance score (0-100%)
  - Key findings extraction

### 3. Ranking Phase
- Calculates overall score based on:
  - Study design quality (35%)
  - Relevance to claim (40%)
  - AI confidence (15%)
  - Recency (10%)
- Selects top N papers (default 5)

### 4. Report Generation
- Creates summary markdown with overview
- Generates individual markdown file for each paper
- Saves to `company/science/find-evidences/` (or custom directory)
- Files include:
  - Full paper metadata (PMID, DOI, authors, journal)
  - AI analysis and reasoning
  - Abstract and key findings
  - Review checklist for experts

### 5. Interactive Review (optional)
- Presents each paper one-by-one
- Shows key metrics and reasoning
- Ask if you want to add to database
- Saves approved papers with `status='pending'` for expert review

## Output Files

### Summary File
`<claim-title>-summary-<date>.md`

Contains:
- Claim information
- Search summary statistics
- Breakdown by stance (supporting/contradicting/neutral/mixed)
- Quick overview of all top papers

### Individual Paper Files
`<claim-title>-paper-<rank>-pmid-<pmid>.md`

Contains:
- Complete paper metadata
- AI analysis with stance and confidence
- Full abstract
- MeSH terms and publication types
- Expert review checklist
- Space for expert notes

## Example Output

```
company/science/find-evidences/
├── vitamin-d-immunity-summary-2024-01-29.md
├── vitamin-d-immunity-paper-1-pmid-12345678.md
├── vitamin-d-immunity-paper-2-pmid-23456789.md
├── vitamin-d-immunity-paper-3-pmid-34567890.md
├── vitamin-d-immunity-paper-4-pmid-45678901.md
└── vitamin-d-immunity-paper-5-pmid-56789012.md
```

## Ranking Algorithm

The overall score for each paper is calculated as:

```
Overall Score = (Design Score × 0.35) +
                (Relevance Score × 0.40) +
                (Confidence Score × 0.15) +
                (Recency Score × 0.10)
```

Where:
- **Design Score**: Study design quality (0-1, from design type)
- **Relevance Score**: Semantic relevance to claim (0-1, from AI analysis)
- **Confidence Score**: AI confidence in stance determination (0-1)
- **Recency Score**: Publication recency (1.0 for ≤2 years, 0.8 for ≤5 years, 0.6 for ≤10 years)

## AI Stance Analysis

### With Anthropic API Key
Uses Claude 3.5 Sonnet to:
- Analyze paper abstract in relation to claim
- Determine stance with reasoning
- Extract key findings
- Calculate relevance and confidence scores

### Without API Key (Fallback)
Uses keyword-based analysis:
- Searches for supporting keywords (support, confirm, evidence for, etc.)
- Searches for contradicting keywords (contradict, disprove, no evidence, etc.)
- Calculates word overlap for relevance
- Lower confidence scores (marked for manual review)

## Integration with Existing Workflow

Papers added through the agent:
- Are saved with `status='pending'`
- Have `source='AI Paper Finder Agent'`
- Include suggested stance from AI analysis
- Follow the same approval process as manual submissions
- Must be reviewed by experts before appearing on claims

## Tips for Best Results

1. **Write Clear Claims**: The agent uses claim title and description for search
2. **Use Specific Terms**: Include scientific terminology in claim description
3. **Review AI Analysis**: Always verify AI-suggested stance before approving
4. **Check Abstracts**: Read full abstracts in markdown files before adding to database
5. **Use API Key**: For better stance analysis, configure Anthropic API key

## Troubleshooting

### No Papers Found
- Claim may be too specific or use non-scientific language
- Try broadening claim description with more search terms
- Check PubMed directly to verify papers exist

### Low Relevance Scores
- Papers may be tangentially related
- Consider refining claim description
- May need manual paper submission for niche topics

### API Errors
- Check Anthropic API key is valid
- Verify rate limits haven't been exceeded
- Agent will fall back to keyword analysis if API fails

## Future Enhancements

Potential improvements:
- Support for additional databases (Crossref, Semantic Scholar)
- Duplicate detection across claims
- Citation network analysis
- Automatic conflict of interest detection
- Population-specific filtering (women-only studies)
- Integration with paper review workflow

## Technical Details

### Files Structure

```
src/lib/
├── pubmed-search.ts       # PubMed API integration
├── paper-analyzer.ts      # AI stance analysis
├── paper-ranker.ts        # Ranking algorithm
└── markdown-generator.ts  # Report generation

scripts/
└── find-papers-agent.ts   # Main orchestrator
```

### Key Functions

- `searchPubMed()`: Searches PubMed with filters
- `analyzePaper()`: AI-powered stance analysis
- `rankPapers()`: Ranks by composite score
- `generatePaperMarkdown()`: Creates detailed reports

## Support

For issues or questions:
- Check this documentation
- Review generated markdown files for errors
- Verify environment variables are set
- Check the GitHub issues for similar problems
