import type { AnalyzedPaper } from './paper-analyzer';
import { logger } from './logger';

export interface RankedPaper extends AnalyzedPaper {
  overallScore: number;
  rank: number;
}

export interface RankingWeights {
  studyDesign: number;
  relevance: number;
  confidence: number;
  recency: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  studyDesign: 0.35,
  relevance: 0.40,
  confidence: 0.15,
  recency: 0.10
};

function calculateRecencyScore(publicationYear: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - publicationYear;

  if (age <= 2) return 1.0;
  if (age <= 5) return 0.8;
  if (age <= 10) return 0.6;
  return 0.4;
}

function normalizeScore(value: number, max: number): number {
  return Math.max(0, Math.min(1, value / max));
}

function calculateOverallScore(
  paper: AnalyzedPaper,
  weights: RankingWeights = DEFAULT_WEIGHTS
): number {
  const designScore = normalizeScore(paper.designScore, 5);

  const relevanceScore = paper.analysis.relevanceScore;

  const confidenceScore = paper.analysis.confidence;

  const recencyScore = calculateRecencyScore(paper.publicationYear);

  const overallScore =
    designScore * weights.studyDesign +
    relevanceScore * weights.relevance +
    confidenceScore * weights.confidence +
    recencyScore * weights.recency;

  return Math.max(0, Math.min(1, overallScore));
}

export function rankPapers(
  papers: AnalyzedPaper[],
  weights?: RankingWeights,
  limit: number = 5
): RankedPaper[] {
  logger.log(`Ranking ${papers.length} papers (limit: ${limit})`);

  const scoredPapers = papers
    .map(paper => ({
      ...paper,
      overallScore: calculateOverallScore(paper, weights),
      rank: 0
    }))
    .sort((a, b) => b.overallScore - a.overallScore);

  const rankedPapers = scoredPapers
    .slice(0, limit)
    .map((paper, index) => ({
      ...paper,
      rank: index + 1
    }));

  logger.log(`Top ${rankedPapers.length} papers selected`);
  rankedPapers.forEach((paper, idx) => {
    logger.log(
      `#${idx + 1}: ${paper.title.substring(0, 60)}... (score: ${paper.overallScore.toFixed(3)})`
    );
  });

  return rankedPapers;
}

export function getStudyDesignLabel(designScore: number): string {
  switch (designScore) {
    case 5: return 'Meta-Analysis';
    case 4: return 'Systematic Review';
    case 3: return 'Randomized Controlled Trial';
    case 2: return 'Clinical Trial';
    case 1: return 'Observational Study';
    default: return 'Research Article';
  }
}

export function groupPapersByStance(papers: RankedPaper[]): {
  supporting: RankedPaper[];
  contradicting: RankedPaper[];
  neutral: RankedPaper[];
  mixed: RankedPaper[];
} {
  return {
    supporting: papers.filter(p => p.analysis.stance === 'supporting'),
    contradicting: papers.filter(p => p.analysis.stance === 'contradicting'),
    neutral: papers.filter(p => p.analysis.stance === 'neutral'),
    mixed: papers.filter(p => p.analysis.stance === 'mixed')
  };
}
