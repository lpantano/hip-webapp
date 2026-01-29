import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

dotenv.config({ path: '.env.local' });
import { searchPubMed, getStudyDesignScore, isPeerReviewed, type PubMedPaper } from './lib/pubmed-search-node';
import { analyzePapers, type AnalyzedPaper } from './lib/paper-analyzer-node';
import { rankPapers, type RankedPaper, groupPapersByStance } from '../src/lib/paper-ranker';
import {
  generatePaperMarkdown,
  generateSummaryMarkdown,
  generateFilename,
  generateSummaryFilename
} from '../src/lib/markdown-generator';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

const RESULTS_DIR = 'company/science/find-evidences';

interface ClaimData {
  id: string;
  title: string;
  description: string;
  category: string;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

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

async function findPapersForClaim(claim: ClaimData, limit: number = 5): Promise<RankedPaper[]> {
  console.log(`\n🔍 Searching PubMed for papers related to: "${claim.title}"\n`);

  const searchQuery = `${claim.title} ${claim.description}`;

  const papers = await searchPubMed(searchQuery, {
    maxResults: 20,
    yearsBack: 10,
    includeMetaAnalyses: true,
    includeClinicalTrials: true
  });

  console.log(`✅ Found ${papers.length} papers from PubMed\n`);

  const peerReviewedPapers = papers.filter(isPeerReviewed);
  console.log(`📄 Filtered to ${peerReviewedPapers.length} peer-reviewed papers\n`);

  const papersWithScores = peerReviewedPapers.map(paper => ({
    paper,
    designScore: getStudyDesignScore(paper)
  }));

  console.log(`🤖 Analyzing papers with AI...\n`);
  const analyzedPapers = await analyzePapers(
    claim.title,
    claim.description,
    papersWithScores
  );

  console.log(`📊 Ranking papers by study design and relevance...\n`);
  const rankedPapers = rankPapers(analyzedPapers, undefined, limit);

  return rankedPapers;
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveMarkdownFiles(
  papers: RankedPaper[],
  claim: ClaimData,
  outputDir: string
): string[] {
  ensureDirectoryExists(outputDir);

  const searchDate = new Date();
  const filePaths: string[] = [];

  const summaryMarkdown = generateSummaryMarkdown(
    papers,
    claim.title,
    claim.description,
    claim.id,
    searchDate
  );
  const summaryFilename = generateSummaryFilename(claim.title, searchDate);
  const summaryPath = path.join(outputDir, summaryFilename);
  fs.writeFileSync(summaryPath, summaryMarkdown, 'utf-8');
  filePaths.push(summaryPath);

  console.log(`\n📝 Saved summary to: ${summaryPath}\n`);

  papers.forEach(paper => {
    const markdown = generatePaperMarkdown(paper, claim.title, claim.id);
    const filename = generateFilename(claim.title, paper.rank, paper.pmid);
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, markdown, 'utf-8');
    filePaths.push(filePath);
    console.log(`📄 Saved: ${filename}`);
  });

  return filePaths;
}

async function addPaperToDatabase(
  paper: RankedPaper,
  claimId: string,
  userId: string
): Promise<void> {
  const insertData = {
    claim_id: claimId,
    title: paper.title,
    journal: paper.journal,
    publication_year: paper.publicationYear,
    doi: paper.doi || null,
    url: paper.pubmedUrl,
    abstract: paper.abstract,
    stance: paper.analysis.stance as 'supporting' | 'contradicting' | 'neutral' | 'mixed',
    source: 'AI Paper Finder Agent',
    submitted_by: userId,
    status: 'pending'
  };

  const { error } = await supabase
    .from('publications')
    .insert(insertData);

  if (error) {
    throw new Error(`Failed to add paper to database: ${error.message}`);
  }

  console.log(`✅ Added paper to database (pending expert review)`);
}

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

async function reviewPapersInteractively(
  papers: RankedPaper[],
  claimId: string
): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 INTERACTIVE PAPER REVIEW`);
  console.log(`${'='.repeat(80)}\n`);

  const grouped = groupPapersByStance(papers);

  console.log(`Papers by stance:`);
  console.log(`  ✅ Supporting: ${grouped.supporting.length}`);
  console.log(`  ❌ Contradicting: ${grouped.contradicting.length}`);
  console.log(`  ⚪ Neutral: ${grouped.neutral.length}`);
  console.log(`  🔄 Mixed: ${grouped.mixed.length}\n`);

  const rl = createReadlineInterface();

  const userIdAnswer = await askQuestion(
    rl,
    'Enter your user ID (or press Enter to skip adding to database): '
  );

  const userId = userIdAnswer || null;

  for (const paper of papers) {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Paper ${paper.rank}/${papers.length}: ${paper.title}`);
    console.log(`${'-'.repeat(80)}`);
    console.log(`Stance: ${paper.analysis.stance.toUpperCase()}`);
    console.log(`Study Design: ${paper.designScore}/5 (${paper.publicationTypes.join(', ')})`);
    console.log(`Relevance: ${(paper.analysis.relevanceScore * 100).toFixed(0)}%`);
    console.log(`Overall Score: ${(paper.overallScore * 100).toFixed(1)}%`);
    console.log(`Year: ${paper.publicationYear}`);
    console.log(`Journal: ${paper.journal}`);
    console.log(`PubMed: ${paper.pubmedUrl}`);
    console.log(`\nReasoning: ${paper.analysis.reasoning}\n`);

    if (!userId) {
      const continueAnswer = await askQuestion(rl, 'Continue to next paper? (y/n): ');
      if (continueAnswer.toLowerCase() !== 'y') {
        break;
      }
      continue;
    }

    const answer = await askQuestion(
      rl,
      'Add this paper to database? (y/n/s=skip all): '
    );

    if (answer.toLowerCase() === 's') {
      console.log('\n⏭️  Skipping remaining papers...');
      break;
    }

    if (answer.toLowerCase() === 'y') {
      try {
        await addPaperToDatabase(paper, claimId, userId);
      } catch (error) {
        console.error(`❌ Error adding paper:`, error);
      }
    } else {
      console.log('⏭️  Skipped');
    }
  }

  rl.close();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ Review complete!`);
  console.log(`${'='.repeat(80)}\n`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: npm run find-papers <claim-id> [options]

Options:
  --limit <n>       Number of papers to find (default: 5)
  --output <dir>    Output directory (default: ${RESULTS_DIR})
  --no-review       Skip interactive review
  --help, -h        Show this help message

Examples:
  npm run find-papers abc123
  npm run find-papers abc123 --limit 10
  npm run find-papers abc123 --output my-papers
  npm run find-papers abc123 --no-review
    `);
    process.exit(0);
  }

  const claimId = args[0];
  let limit = 5;
  let outputDir = RESULTS_DIR;
  let skipReview = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--no-review') {
      skipReview = true;
    }
  }

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🤖 AI PAPER FINDER AGENT`);
    console.log(`${'='.repeat(80)}\n`);

    const claim = await fetchClaimById(claimId);
    console.log(`📌 Claim: ${claim.title}`);
    console.log(`📝 Category: ${claim.category}\n`);

    const papers = await findPapersForClaim(claim, limit);

    if (papers.length === 0) {
      console.log(`\n⚠️  No papers found for this claim.\n`);
      process.exit(0);
    }

    const filePaths = saveMarkdownFiles(papers, claim, outputDir);

    console.log(`\n✅ Saved ${filePaths.length} markdown files to: ${outputDir}\n`);

    if (!skipReview) {
      await reviewPapersInteractively(papers, claim.id);
    }

    console.log(`\n🎉 All done! Check the markdown files for detailed analysis.\n`);
  } catch (error) {
    console.error(`\n❌ Error:`, error);
    process.exit(1);
  }
}

main();
