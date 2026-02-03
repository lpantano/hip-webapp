import type { RankedPaper } from './paper-ranker';
import { getStudyDesignLabel } from './paper-ranker';

function formatStance(stance: string): string {
  const stanceMap = {
    supporting: '✅ Supporting',
    contradicting: '❌ Contradicting',
    neutral: '⚪ Neutral',
    mixed: '🔄 Mixed Results'
  };
  return stanceMap[stance as keyof typeof stanceMap] || stance;
}

function formatConfidence(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}

export function generatePaperMarkdown(
  paper: RankedPaper,
  claimTitle: string,
  claimId: string
): string {
  const lines: string[] = [];

  lines.push(`# Paper ${paper.rank}: ${paper.title}`);
  lines.push('');
  lines.push('## Metadata');
  lines.push('');
  lines.push(`- **Claim**: ${claimTitle}`);
  lines.push(`- **Claim ID**: ${claimId}`);
  lines.push(`- **PMID**: [${paper.pmid}](${paper.pubmedUrl})`);
  if (paper.doi) {
    lines.push(`- **DOI**: [${paper.doi}](https://doi.org/${paper.doi})`);
  }
  lines.push(`- **Journal**: ${paper.journal}`);
  lines.push(`- **Publication Year**: ${paper.publicationYear}`);
  lines.push(`- **Study Design**: ${getStudyDesignLabel(paper.designScore)} (Score: ${paper.designScore}/5)`);
  lines.push('');

  lines.push('## Authors');
  lines.push('');
  if (paper.authors.length > 0) {
    if (paper.authors.length <= 10) {
      lines.push(paper.authors.join(', '));
    } else {
      lines.push(`${paper.authors.slice(0, 10).join(', ')}, et al. (${paper.authors.length} total authors)`);
    }
  } else {
    lines.push('Authors not available');
  }
  lines.push('');

  lines.push('## AI Analysis');
  lines.push('');
  lines.push(`- **Stance**: ${formatStance(paper.analysis.stance)}`);
  lines.push(`- **Confidence**: ${formatConfidence(paper.analysis.confidence)} (${(paper.analysis.confidence * 100).toFixed(0)}%)`);
  lines.push(`- **Relevance Score**: ${(paper.analysis.relevanceScore * 100).toFixed(0)}%`);
  lines.push(`- **Overall Score**: ${(paper.overallScore * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('### Reasoning');
  lines.push('');
  lines.push(paper.analysis.reasoning);
  lines.push('');

  if (paper.analysis.keyFindings.length > 0) {
    lines.push('### Key Findings');
    lines.push('');
    paper.analysis.keyFindings.forEach(finding => {
      lines.push(`- ${finding}`);
    });
    lines.push('');
  }

  lines.push('## Abstract');
  lines.push('');
  lines.push(paper.abstract);
  lines.push('');

  if (paper.meshTerms.length > 0) {
    lines.push('## MeSH Terms');
    lines.push('');
    lines.push(paper.meshTerms.slice(0, 10).join(', '));
    lines.push('');
  }

  if (paper.publicationTypes.length > 0) {
    lines.push('## Publication Types');
    lines.push('');
    lines.push(paper.publicationTypes.join(', '));
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Review Status');
  lines.push('');
  lines.push('- [ ] Paper reviewed by expert');
  lines.push('- [ ] Approved for addition to database');
  lines.push('- [ ] Added to Evidence Decoded');
  lines.push('');
  lines.push('### Expert Notes');
  lines.push('');
  lines.push('_Add your expert review notes here..._');
  lines.push('');

  return lines.join('\n');
}

export function generateSummaryMarkdown(
  papers: RankedPaper[],
  claimTitle: string,
  claimDescription: string,
  claimId: string,
  searchDate: Date
): string {
  const lines: string[] = [];

  lines.push(`# Paper Search Results: ${claimTitle}`);
  lines.push('');
  lines.push(`**Search Date**: ${searchDate.toISOString().split('T')[0]}`);
  lines.push(`**Claim ID**: ${claimId}`);
  lines.push('');

  lines.push('## Claim Description');
  lines.push('');
  lines.push(claimDescription);
  lines.push('');

  lines.push('## Search Summary');
  lines.push('');
  lines.push(`- **Total Papers Found**: ${papers.length}`);

  const stanceCounts = {
    supporting: papers.filter(p => p.analysis.stance === 'supporting').length,
    contradicting: papers.filter(p => p.analysis.stance === 'contradicting').length,
    neutral: papers.filter(p => p.analysis.stance === 'neutral').length,
    mixed: papers.filter(p => p.analysis.stance === 'mixed').length
  };

  lines.push(`- **Supporting**: ${stanceCounts.supporting}`);
  lines.push(`- **Contradicting**: ${stanceCounts.contradicting}`);
  lines.push(`- **Neutral**: ${stanceCounts.neutral}`);
  lines.push(`- **Mixed**: ${stanceCounts.mixed}`);
  lines.push('');

  lines.push('## Top Papers');
  lines.push('');
  papers.forEach((paper, idx) => {
    lines.push(`### ${idx + 1}. ${paper.title}`);
    lines.push('');
    lines.push(`- **Stance**: ${formatStance(paper.analysis.stance)}`);
    lines.push(`- **Study Design**: ${getStudyDesignLabel(paper.designScore)}`);
    lines.push(`- **Year**: ${paper.publicationYear}`);
    lines.push(`- **Overall Score**: ${(paper.overallScore * 100).toFixed(1)}%`);
    lines.push(`- **Link**: [PubMed](${paper.pubmedUrl})`);
    lines.push('');
  });

  lines.push('---');
  lines.push('');
  lines.push('## Next Steps');
  lines.push('');
  lines.push('1. Review each paper individually (see separate markdown files)');
  lines.push('2. Expert assessment of relevance and quality');
  lines.push('3. Approve papers for addition to Evidence Decoded database');
  lines.push('');

  return lines.join('\n');
}

export function sanitizeFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export function generateFilename(claimTitle: string, paperRank: number, pmid: string): string {
  const sanitized = sanitizeFilename(claimTitle);
  return `${sanitized}-paper-${paperRank}-pmid-${pmid}.md`;
}

export function generateSummaryFilename(claimTitle: string, date: Date): string {
  const sanitized = sanitizeFilename(claimTitle);
  const dateStr = date.toISOString().split('T')[0];
  return `${sanitized}-summary-${dateStr}.md`;
}
