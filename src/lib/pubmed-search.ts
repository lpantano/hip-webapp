import { logger } from './logger';

export interface PubMedPaper {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationYear: number;
  doi?: string;
  pubmedUrl: string;
  meshTerms: string[];
  publicationTypes: string[];
}

export interface PubMedSearchOptions {
  maxResults?: number;
  yearsBack?: number;
  includeMetaAnalyses?: boolean;
  includeClinicalTrials?: boolean;
}

const PUBMED_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

function buildSearchQuery(claimText: string, options: PubMedSearchOptions): string {
  const terms: string[] = [];

  terms.push(`(${claimText})`);

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - (options.yearsBack || 10);
  terms.push(`${startYear}:${currentYear}[pdat]`);

  if (options.includeMetaAnalyses || options.includeClinicalTrials) {
    const pubTypes: string[] = [];
    if (options.includeMetaAnalyses) {
      pubTypes.push('Meta-Analysis[ptyp]', 'Systematic Review[ptyp]');
    }
    if (options.includeClinicalTrials) {
      pubTypes.push('Randomized Controlled Trial[ptyp]', 'Clinical Trial[ptyp]');
    }
    if (pubTypes.length > 0) {
      terms.push(`(${pubTypes.join(' OR ')})`);
    }
  }

  return terms.join(' AND ');
}

export async function searchPubMed(
  claimText: string,
  options: PubMedSearchOptions = {}
): Promise<PubMedPaper[]> {
  const maxResults = options.maxResults || 20;

  try {
    const searchQuery = buildSearchQuery(claimText, options);
    logger.log('PubMed search query:', searchQuery);

    const searchUrl = `${PUBMED_API_BASE}/esearch.fcgi?` +
      `db=pubmed&` +
      `term=${encodeURIComponent(searchQuery)}&` +
      `retmax=${maxResults}&` +
      `retmode=json&` +
      `sort=relevance`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const pmids = searchData.esearchresult?.idlist || [];
    if (pmids.length === 0) {
      logger.log('No papers found for query');
      return [];
    }

    logger.log(`Found ${pmids.length} papers, fetching details...`);

    const fetchUrl = `${PUBMED_API_BASE}/efetch.fcgi?` +
      `db=pubmed&` +
      `id=${pmids.join(',')}&` +
      `retmode=xml`;

    const fetchResponse = await fetch(fetchUrl);
    const xmlText = await fetchResponse.text();

    const papers = parsePublicationsFromXML(xmlText);
    logger.log(`Successfully parsed ${papers.length} papers`);

    return papers;
  } catch (error) {
    logger.error('Error searching PubMed:', error);
    throw new Error('Failed to search PubMed. Please try again.');
  }
}

function parsePublicationsFromXML(xml: string): PubMedPaper[] {
  const papers: PubMedPaper[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const articles = doc.querySelectorAll('PubmedArticle');

  articles.forEach((article) => {
    try {
      const pmid = article.querySelector('PMID')?.textContent || '';
      const title = article.querySelector('ArticleTitle')?.textContent || '';

      const abstractParts = article.querySelectorAll('AbstractText');
      let abstract = '';
      if (abstractParts.length > 0) {
        abstract = Array.from(abstractParts)
          .map(part => {
            const label = part.getAttribute('Label');
            const text = part.textContent || '';
            return label ? `${label}: ${text}` : text;
          })
          .join('\n\n');
      }

      const authorNodes = article.querySelectorAll('Author');
      const authors = Array.from(authorNodes).map(author => {
        const lastName = author.querySelector('LastName')?.textContent || '';
        const foreName = author.querySelector('ForeName')?.textContent || '';
        return `${foreName} ${lastName}`.trim();
      }).filter(name => name);

      const journal = article.querySelector('Journal Title')?.textContent ||
                     article.querySelector('ISOAbbreviation')?.textContent || '';

      const year = article.querySelector('PubDate Year')?.textContent ||
                   article.querySelector('MedlineDate')?.textContent?.match(/\d{4}/)?.[0] || '';

      const articleIds = article.querySelectorAll('ArticleId');
      let doi = '';
      articleIds.forEach(id => {
        if (id.getAttribute('IdType') === 'doi') {
          doi = id.textContent || '';
        }
      });

      const meshTerms = Array.from(article.querySelectorAll('MeshHeading DescriptorName'))
        .map(node => node.textContent || '')
        .filter(term => term);

      const publicationTypes = Array.from(article.querySelectorAll('PublicationType'))
        .map(node => node.textContent || '')
        .filter(type => type);

      if (pmid && title) {
        papers.push({
          pmid,
          title,
          abstract: abstract || 'No abstract available',
          authors: authors.length > 0 ? authors : ['Authors not listed'],
          journal,
          publicationYear: parseInt(year) || new Date().getFullYear(),
          doi,
          pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          meshTerms,
          publicationTypes
        });
      }
    } catch (error) {
      logger.error('Error parsing article:', error);
    }
  });

  return papers;
}

export function isPeerReviewed(paper: PubMedPaper): boolean {
  const nonPeerReviewedTypes = [
    'Preprint',
    'Comment',
    'Editorial',
    'Letter',
    'News'
  ];

  return !paper.publicationTypes.some(type =>
    nonPeerReviewedTypes.some(excluded => type.includes(excluded))
  );
}

export function getStudyDesignScore(paper: PubMedPaper): number {
  const pubTypes = paper.publicationTypes.map(t => t.toLowerCase());

  if (pubTypes.some(t => t.includes('meta-analysis'))) return 5;
  if (pubTypes.some(t => t.includes('systematic review'))) return 4;
  if (pubTypes.some(t => t.includes('randomized controlled trial'))) return 3;
  if (pubTypes.some(t => t.includes('clinical trial'))) return 2;
  if (pubTypes.some(t => t.includes('observational study'))) return 1;

  return 0;
}
