# Paper Finder Agent - Quick Start Guide

Get started with the AI Paper Finder Agent in 5 minutes!

## Overview

The Paper Finder Agent is a **Claude Code subagent** that searches PubMed for scientific papers and analyzes them using your current Claude session. No API keys needed - it uses the Claude instance you're already talking to!

## Step 1: Find a Claim ID

1. Go to your Evidence Decoded database
2. Find a claim you want to research
3. Copy its claim ID (UUID format like: `abc123-def456-ghi789`)

Or query from Supabase:
```sql
SELECT id, title FROM claims LIMIT 5;
```

## Step 2: Use the Subagent in Chat

In your Claude Code session, simply ask:

```
Use paper-finder to find papers for claim 550e8400-e29b-41d4-a716-446655440000
```

Or more naturally:

```
Find scientific papers about vitamin D and immunity
Search for research on menopause and hot flashes
```

## Step 3: The Agent Works For You

The paper-finder subagent will:
1. **Fetch papers** from PubMed (last 10 years, peer-reviewed)
2. **Analyze each paper** using its own Claude context
3. **Determine stance** (supporting/contradicting/neutral/mixed)
4. **Calculate scores** based on quality and relevance
5. **Generate markdown reports** with detailed analysis
6. **Present results** clearly organized by stance

## Step 4: Review the Results

The subagent shows you:
- Total papers found
- Breakdown by stance (e.g., "3 supporting, 1 contradicting, 1 neutral")
- Top papers with scores and key findings
- Location of generated markdown files

### Output Files

The subagent creates detailed markdown files:

```
company/science/find-evidences/
├── <claim-title>-summary-<date>.md     ← Overview
├── <claim-title>-paper-1-pmid-xxx.md   ← Top paper
├── <claim-title>-paper-2-pmid-xxx.md
├── <claim-title>-paper-3-pmid-xxx.md
├── <claim-title>-paper-4-pmid-xxx.md
└── <claim-title>-paper-5-pmid-xxx.md
```

Each file includes:
- Paper metadata (title, authors, journal, DOI, PMID)
- **AI analysis from the subagent** (stance, confidence, reasoning)
- Key findings extracted from abstract
- Full abstract
- Study design score
- Expert review checklist

## Step 5: Continue the Conversation

You can ask the subagent follow-up questions:

```
Show me more details about the top paper
What papers contradict the claim?
Can you analyze 10 more papers?
Explain why you rated that paper as supporting
```

The subagent keeps context and can help you understand the results.

## Common Requests

### Find More Papers
```
Use paper-finder to find 10 papers for claim abc123
```

### Focus on Specific Types
```
Find meta-analyses and systematic reviews about [claim]
Show me only papers that support the claim
```

### Get Details
```
Show me the abstract for paper 3
Explain why you think this paper contradicts the claim
What's the confidence level for the top paper?
```

## Example Workflow

```
User: Find papers for the vitamin D and immunity claim

Subagent: I'll search for that claim... Found it! Fetching papers from PubMed...
          Found 18 peer-reviewed papers. Analyzing top 5...

          [Shows analysis progress]

          Analysis complete! Results:
          - 3 supporting papers
          - 1 contradicting paper
          - 1 neutral paper

          Top paper: "Vitamin D supplementation and immune function" (2022)
          - Meta-Analysis (5/5)
          - Supports claim (85% confidence)
          - Key finding: 12% reduction in infection risk

          Markdown files saved to company/science/find-evidences/

User: Show me the contradicting paper

Subagent: [Presents details of the contradicting paper with reasoning]

User: Thanks! Can you add the top 3 to the database?

Subagent: [Guides through database addition process]
```

## Troubleshooting

### "No papers found"
- Claim might be too specific or use non-scientific language
- The subagent will suggest trying different search terms
- You can ask it to search PubMed manually

### "Script error"
- Check that Supabase credentials are in `.env.local`
- Verify claim ID is correct
- The subagent will help diagnose the issue

### Low confidence scores
- Abstracts may not contain enough information
- Subagent will be transparent about uncertainty
- You can ask for its reasoning

## Why This Design?

**No API keys needed** - Uses your current Claude session for analysis

**Transparent** - You see the reasoning for each stance determination

**Interactive** - Ask follow-up questions, refine results

**Free** - No additional API costs beyond your Claude Code usage

**Flexible** - Adjust analysis on the fly based on your feedback

## Next Steps

- Read the [full documentation](./PAPER_FINDER_AGENT.md) for details
- Try it with a claim from your database
- Review the generated markdown files
- Ask the subagent to explain its reasoning
- Use results to inform expert reviews

## Tips

1. **Let the subagent work**: It will handle fetching and analysis
2. **Ask questions**: "Why did you rate this as supporting?"
3. **Check study quality**: Meta-analyses (5/5) are highest quality
4. **Review key findings**: Subagent extracts them from abstracts
5. **Keep markdown files**: They serve as research audit trail
6. **Be interactive**: The subagent can adjust its analysis based on your feedback

Happy paper hunting! 🔍📄
