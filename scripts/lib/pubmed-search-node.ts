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
    console.log('PubMed search query:', searchQuery);

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
      console.log('No papers found for query');
      return [];
    }

    console.log(`Found ${pmids.length} papers, fetching details...`);

    const fetchUrl = `${PUBMED_API_BASE}/efetch.fcgi?` +
      `db=pubmed&` +
      `id=${pmids.join(',')}&` +
      `retmode=xml`;

    const fetchResponse = await fetch(fetchUrl);
    const xmlText = await fetchResponse.text();

    const papers = parsePublicationsFromXML(xmlText);
    console.log(`Successfully parsed ${papers.length} papers`);

    return papers;
  } catch (error) {
    console.error('Error searching PubMed:', error);
    throw new Error('Failed to search PubMed. Please try again.');
  }
}

function extractTextContent(xml: string, tagName: string, startIndex: number = 0): string {
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;
  const openIndex = xml.indexOf(openTag, startIndex);
  if (openIndex === -1) return '';
  const contentStart = openIndex + openTag.length;
  const closeIndex = xml.indexOf(closeTag, contentStart);
  if (closeIndex === -1) return '';
  return xml.substring(contentStart, closeIndex).trim();
}

function extractAllTextContent(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const openTag = `<${tagName}`;
  let searchIndex = 0;

  while (true) {
    const openIndex = xml.indexOf(openTag, searchIndex);
    if (openIndex === -1) break;

    const tagCloseIndex = xml.indexOf('>', openIndex);
    if (tagCloseIndex === -1) break;

    const closeTag = `</${tagName}>`;
    const closeIndex = xml.indexOf(closeTag, tagCloseIndex);
    if (closeIndex === -1) break;

    const content = xml.substring(tagCloseIndex + 1, closeIndex).trim();
    if (content) {
      const cleanContent = content.replace(/<[^>]+>/g, '').trim();
      if (cleanContent) results.push(cleanContent);
    }

    searchIndex = closeIndex + closeTag.length;
  }

  return results;
}

function parsePublicationsFromXML(xml: string): PubMedPaper[] {
  const papers: PubMedPaper[] = [];
  const articles = xml.split('<PubmedArticle>').slice(1);

  for (const articleXml of articles) {
    try {
      const pmid = extractTextContent(articleXml, 'PMID');
      const title = extractTextContent(articleXml, 'ArticleTitle');

      if (!pmid || !title) continue;

      const abstractParts = extractAllTextContent(articleXml, 'AbstractText');
      const abstract = abstractParts.length > 0
        ? abstractParts.join('\n\n')
        : 'No abstract available';

      const lastNames = extractAllTextContent(articleXml, 'LastName');
      const foreNames = extractAllTextContent(articleXml, 'ForeName');
      const authors = lastNames.map((lastName, i) => {
        const foreName = foreNames[i] || '';
        return `${foreName} ${lastName}`.trim();
      }).filter(name => name);

      let journal = extractTextContent(articleXml, 'Title');
      if (!journal) {
        journal = extractTextContent(articleXml, 'ISOAbbreviation');
      }

      let year = extractTextContent(articleXml, 'Year');
      if (!year) {
        const medlineDate = extractTextContent(articleXml, 'MedlineDate');
        const yearMatch = medlineDate.match(/\d{4}/);
        year = yearMatch ? yearMatch[0] : '';
      }

      let doi = '';
      const articleIdMatches = articleXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
      if (articleIdMatches) {
        doi = articleIdMatches[1];
      }

      const meshTerms = extractAllTextContent(articleXml, 'DescriptorName');
      const publicationTypes = extractAllTextContent(articleXml, 'PublicationType');

      papers.push({
        pmid,
        title,
        abstract,
        authors: authors.length > 0 ? authors : ['Authors not listed'],
        journal: journal || 'Journal not available',
        publicationYear: parseInt(year) || new Date().getFullYear(),
        doi,
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        meshTerms,
        publicationTypes
      });
    } catch (error) {
      console.error('Error parsing article:', error);
    }
  }

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
