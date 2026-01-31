#!/usr/bin/env tsx
/**
 * Paper Finder Script for Claude Agent
 *
 * Searches PubMed for papers related to a health claim text.
 * Outputs JSON to stdout for consumption by the paper-finder agent.
 * All logs go to stderr to keep stdout clean for JSON output.
 *
 * Usage:
 *   npm run find-papers -- --claim "vitamin D improves immunity" --limit 20
 *   npm run find-papers -- --claim "omega-3 reduces inflammation" --limit 10
 */

import { searchPubMed, getStudyDesignScore, isPeerReviewed, type PubMedPaper } from './lib/pubmed-search-node';

interface PaperOutput {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationYear: number;
  doi: string | null;
  pubmedUrl: string;
  meshTerms: string[];
  publicationTypes: string[];
  designScore: number;
  designLabel: string;
  isPeerReviewed: boolean;
}

interface OutputData {
  claim: string;
  searchDate: string;
  totalFound: number;
  papers: PaperOutput[];
  searchParameters: {
    maxResults: number;
    yearsBack: number;
    includeMetaAnalyses: boolean;
    includeClinicalTrials: boolean;
  };
}

function log(message: string): void {
  console.error(message);
}

function getDesignLabel(score: number): string {
  switch (score) {
    case 5: return 'Meta-Analysis';
    case 4: return 'Systematic Review';
    case 3: return 'Randomized Controlled Trial';
    case 2: return 'Clinical Trial';
    case 1: return 'Observational Study';
    default: return 'Other Study Type';
  }
}

function transformPaper(paper: PubMedPaper): PaperOutput {
  const designScore = getStudyDesignScore(paper);
  return {
    pmid: paper.pmid,
    title: paper.title,
    abstract: paper.abstract,
    authors: paper.authors,
    journal: paper.journal,
    publicationYear: paper.publicationYear,
    doi: paper.doi || null,
    pubmedUrl: paper.pubmedUrl,
    meshTerms: paper.meshTerms,
    publicationTypes: paper.publicationTypes,
    designScore,
    designLabel: getDesignLabel(designScore),
    isPeerReviewed: isPeerReviewed(paper)
  };
}

function parseArgs(): { claim: string; limit: number } {
  const args = process.argv.slice(2);
  let claim = '';
  let limit = 20;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--claim' && args[i + 1]) {
      claim = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Paper Finder for Claude Agent

Usage:
  npm run find-papers -- --claim "<claim text>" [options]

Options:
  --claim <text>    The health claim to search for (required)
  --limit <n>       Maximum number of papers to fetch (default: 20)
  --help, -h        Show this help message

Examples:
  npm run find-papers -- --claim "vitamin D improves immunity"
  npm run find-papers -- --claim "omega-3 fatty acids reduce inflammation" --limit 10
  npm run find-papers -- --claim "probiotics improve gut health" --limit 15

Output:
  JSON object to stdout with:
  - claim: The search claim text
  - searchDate: ISO date of the search
  - totalFound: Number of papers returned
  - papers: Array of paper objects with metadata and design scores
  - searchParameters: The search configuration used

  All progress logs are written to stderr.
`);
      process.exit(0);
    }
  }

  if (!claim) {
    console.error('Error: --claim is required. Use --help for usage information.');
    process.exit(1);
  }

  return { claim, limit };
}

async function main(): Promise<void> {
  const { claim, limit } = parseArgs();

  log(`🔍 Searching PubMed for: "${claim}"`);
  log(`📊 Fetching up to ${limit} papers...`);

  const searchParameters = {
    maxResults: limit,
    yearsBack: 10,
    includeMetaAnalyses: true,
    includeClinicalTrials: true
  };

  const papers = await searchPubMed(claim, searchParameters);

  log(`✅ Found ${papers.length} papers from PubMed`);

  const peerReviewedPapers = papers.filter(isPeerReviewed);
  log(`📄 Filtered to ${peerReviewedPapers.length} peer-reviewed papers`);

  const transformedPapers = peerReviewedPapers
    .map(transformPaper)
    .sort((a, b) => b.designScore - a.designScore);

  const output: OutputData = {
    claim,
    searchDate: new Date().toISOString(),
    totalFound: transformedPapers.length,
    papers: transformedPapers,
    searchParameters
  };

  console.log(JSON.stringify(output, null, 2));

  log(`\n✅ Output ${transformedPapers.length} papers as JSON`);
  log(`📊 Design score breakdown:`);

  const designCounts = transformedPapers.reduce((acc, p) => {
    acc[p.designLabel] = (acc[p.designLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(designCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([label, count]) => {
      log(`   ${label}: ${count}`);
    });
}

main().catch(error => {
  console.error('❌ Error:', error.message || error);
  process.exit(1);
});
