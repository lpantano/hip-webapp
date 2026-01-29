import * as dotenv from 'dotenv';
import { searchPubMed, getStudyDesignScore, isPeerReviewed, type PubMedPaper } from './lib/pubmed-search-node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

dotenv.config({ path: '.env.local' });

interface ClaimData {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface ScoredPaper extends PubMedPaper {
  designScore: number;
  designLabel: string;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

function getStudyDesignLabel(designScore: number): string {
  switch (designScore) {
    case 5: return 'Meta-Analysis';
    case 4: return 'Systematic Review';
    case 3: return 'Randomized Controlled Trial';
    case 2: return 'Clinical Trial';
    case 1: return 'Observational Study';
    default: return 'Research Article';
  }
}

async function fetchClaimById(claimId: string): Promise<ClaimData> {
  const { data, error } = await supabase
    .from('claims')
    .select('id, title, description, category')
    .eq('id', claimId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch claim: ${error?.message || 'Claim not found'}`);
  }

  return data;
}

async function fetchPapersForClaim(
  claim: ClaimData,
  maxResults: number = 20
): Promise<ScoredPaper[]> {
  console.error(`Searching PubMed for papers related to: "${claim.title}"`);

  const searchQuery = `${claim.title} ${claim.description}`;

  const papers = await searchPubMed(searchQuery, {
    maxResults,
    yearsBack: 10,
    includeMetaAnalyses: true,
    includeClinicalTrials: true
  });

  console.error(`Found ${papers.length} papers from PubMed`);

  const peerReviewedPapers = papers.filter(isPeerReviewed);
  console.error(`Filtered to ${peerReviewedPapers.length} peer-reviewed papers`);

  const scoredPapers: ScoredPaper[] = peerReviewedPapers.map(paper => {
    const designScore = getStudyDesignScore(paper);
    return {
      ...paper,
      designScore,
      designLabel: getStudyDesignLabel(designScore)
    };
  });

  scoredPapers.sort((a, b) => b.designScore - a.designScore);

  return scoredPapers;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.error(`
Usage: npm run fetch-papers <claim-id> [options]

Fetches scientific papers from PubMed for a claim. Outputs JSON for analysis by Claude.

Options:
  --limit <n>       Maximum papers to fetch (default: 20)
  --help, -h        Show this help message

Examples:
  npm run fetch-papers abc123
  npm run fetch-papers abc123 --limit 30
    `);
    process.exit(0);
  }

  const claimId = args[0];
  let maxResults = 20;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      maxResults = parseInt(args[i + 1]);
      i++;
    }
  }

  try {
    const claim = await fetchClaimById(claimId);
    const papers = await fetchPapersForClaim(claim, maxResults);

    const output = {
      claim: {
        id: claim.id,
        title: claim.title,
        description: claim.description,
        category: claim.category
      },
      papers: papers.map(paper => ({
        pmid: paper.pmid,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        journal: paper.journal,
        publicationYear: paper.publicationYear,
        doi: paper.doi,
        pubmedUrl: paper.pubmedUrl,
        meshTerms: paper.meshTerms,
        publicationTypes: paper.publicationTypes,
        designScore: paper.designScore,
        designLabel: paper.designLabel
      })),
      metadata: {
        totalFound: papers.length,
        searchDate: new Date().toISOString(),
        searchParams: {
          yearsBack: 10,
          peerReviewedOnly: true,
          prioritizedTypes: ['Meta-Analysis', 'Systematic Review', 'RCT', 'Clinical Trial']
        }
      }
    };

    console.log(JSON.stringify(output, null, 2));
    console.error(`\nOutput ${papers.length} papers as JSON`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
