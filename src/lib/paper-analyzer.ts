import { logger } from './logger';
import type { PubMedPaper } from './pubmed-search';

export type PaperStance = 'supporting' | 'contradicting' | 'neutral' | 'mixed';

export interface StanceAnalysis {
  stance: PaperStance;
  confidence: number;
  reasoning: string;
  relevanceScore: number;
  keyFindings: string[];
}

export interface AnalyzedPaper extends PubMedPaper {
  analysis: StanceAnalysis;
  designScore: number;
}

async function analyzeStanceWithClaude(
  claimTitle: string,
  claimDescription: string,
  paper: PubMedPaper
): Promise<StanceAnalysis> {
  const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    logger.warn('No Anthropic API key found, using fallback analysis');
    return fallbackStanceAnalysis(claimTitle, claimDescription, paper);
  }

  const prompt = `You are a scientific paper analyst. Analyze the relationship between a health claim and a research paper.

CLAIM TITLE: ${claimTitle}

CLAIM DESCRIPTION: ${claimDescription}

PAPER TITLE: ${paper.title}

PAPER ABSTRACT: ${paper.abstract}

PAPER METADATA:
- Journal: ${paper.journal}
- Year: ${paper.publicationYear}
- Study Types: ${paper.publicationTypes.join(', ')}

Analyze this paper's stance towards the claim. Respond in JSON format:

{
  "stance": "supporting" | "contradicting" | "neutral" | "mixed",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this stance was determined",
  "relevanceScore": 0.0-1.0,
  "keyFindings": ["finding1", "finding2", "finding3"]
}

Guidelines:
- "supporting": The paper provides evidence that supports the claim
- "contradicting": The paper provides evidence that contradicts or disproves the claim
- "neutral": The paper is related but doesn't clearly support or contradict
- "mixed": The paper has findings both supporting and contradicting the claim
- Consider the study design, sample size, and methodology strength
- relevanceScore: How directly related is this paper to the claim (1.0 = highly relevant)
- confidence: How confident are you in this stance determination (1.0 = very confident)
- keyFindings: Extract 2-3 key findings from the abstract`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      stance: analysis.stance,
      confidence: Math.max(0, Math.min(1, analysis.confidence)),
      reasoning: analysis.reasoning,
      relevanceScore: Math.max(0, Math.min(1, analysis.relevanceScore)),
      keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings.slice(0, 3) : []
    };
  } catch (error) {
    logger.error('Error analyzing stance with Claude:', error);
    return fallbackStanceAnalysis(claimTitle, claimDescription, paper);
  }
}

function fallbackStanceAnalysis(
  claimTitle: string,
  claimDescription: string,
  paper: PubMedPaper
): StanceAnalysis {
  const claimText = `${claimTitle} ${claimDescription}`.toLowerCase();
  const paperText = `${paper.title} ${paper.abstract}`.toLowerCase();

  const supportingKeywords = [
    'support', 'confirm', 'evidence for', 'demonstrate', 'show',
    'indicate', 'suggest', 'associated with', 'beneficial', 'effective',
    'improve', 'increase', 'positive effect', 'correlation'
  ];

  const contradictingKeywords = [
    'contradict', 'disprove', 'no evidence', 'failed to', 'did not',
    'no significant', 'not associated', 'ineffective', 'no effect',
    'no difference', 'refute', 'challenge', 'negative'
  ];

  const supportScore = supportingKeywords.filter(kw => paperText.includes(kw)).length;
  const contradictScore = contradictingKeywords.filter(kw => paperText.includes(kw)).length;

  const claimWords = claimText.split(/\s+/).filter(w => w.length > 3);
  const relevantWords = claimWords.filter(word => paperText.includes(word));
  const relevanceScore = Math.min(1, relevantWords.length / Math.max(claimWords.length, 1));

  let stance: PaperStance = 'neutral';
  let confidence = 0.5;

  if (supportScore > contradictScore && supportScore > 0) {
    stance = 'supporting';
    confidence = Math.min(0.7, 0.5 + (supportScore * 0.1));
  } else if (contradictScore > supportScore && contradictScore > 0) {
    stance = 'contradicting';
    confidence = Math.min(0.7, 0.5 + (contradictScore * 0.1));
  } else if (supportScore > 0 && contradictScore > 0) {
    stance = 'mixed';
    confidence = 0.6;
  }

  return {
    stance,
    confidence,
    reasoning: 'Automatic keyword-based analysis (API key not configured)',
    relevanceScore,
    keyFindings: ['Automatic analysis - manual review recommended']
  };
}

export async function analyzePaper(
  claimTitle: string,
  claimDescription: string,
  paper: PubMedPaper,
  designScore: number
): Promise<AnalyzedPaper> {
  logger.log(`Analyzing paper: ${paper.title}`);

  const analysis = await analyzeStanceWithClaude(claimTitle, claimDescription, paper);

  return {
    ...paper,
    analysis,
    designScore
  };
}

export async function analyzePapers(
  claimTitle: string,
  claimDescription: string,
  papers: Array<{ paper: PubMedPaper; designScore: number }>
): Promise<AnalyzedPaper[]> {
  logger.log(`Analyzing ${papers.length} papers...`);

  const analyzedPapers = await Promise.all(
    papers.map(({ paper, designScore }) =>
      analyzePaper(claimTitle, claimDescription, paper, designScore)
    )
  );

  logger.log('Paper analysis complete');
  return analyzedPapers;
}
