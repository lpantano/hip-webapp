import { logger } from '@/lib/logger';

interface PublicationData {
  title?: string;
  journal?: string;
  year?: number;
  abstract?: string;
  url?: string;
  authors?: string[];
}

export class DOIService {
  private static readonly CROSSREF_API = 'https://api.crossref.org/works/';
  private static readonly OPENALEX_API = 'https://api.openalex.org/works/';
  private static readonly PUBMED_ESUMMARY_API = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
  private static readonly PUBMED_EFETCH_API = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

  static async fetchPublicationData(input: string): Promise<PublicationData | null> {
    if (!input) return null;

    // Check if input is a PubMed URL
    const pmid = this.extractPMID(input);
    if (pmid) {
      return await this.fetchFromPubMed(pmid);
    }

    // Clean DOI
    const cleanDoi = input.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');

    try {
      // Try Crossref first (more reliable for DOI lookups)
      const crossrefData = await this.fetchFromCrossref(cleanDoi);
      if (crossrefData) return crossrefData;

      // Fallback to OpenAlex
      const openAlexData = await this.fetchFromOpenAlex(cleanDoi);
      if (openAlexData) return openAlexData;

      return null;
    } catch (error) {
      logger.error('Error fetching publication data:', error);
      return null;
    }
  }

  private static extractPMID(input: string): string | null {
    // Match various PubMed URL formats
    const pubmedPatterns = [
      /(?:https?:\/\/)?(?:www\.)?pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?/i,
      /(?:https?:\/\/)?(?:www\.)?ncbi\.nlm\.nih\.gov\/pubmed\/(\d+)\/?/i,
      /pmid:?\s*(\d+)/i,
    ];

    for (const pattern of pubmedPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Check if input is just a PMID number
    if (/^\d+$/.test(input.trim())) {
      return input.trim();
    }

    return null;
  }

  private static async fetchFromCrossref(doi: string): Promise<PublicationData | null> {
    try {
      const response = await fetch(`${this.CROSSREF_API}${encodeURIComponent(doi)}`);
      if (!response.ok) return null;

      const data = await response.json();
      const work = data.message;

      if (!work) return null;

      const title = work.title?.[0] || '';
      const journal = work['container-title']?.[0] || '';
      const year = work.published?.['date-parts']?.[0]?.[0] || 
                   work.created?.['date-parts']?.[0]?.[0] || 
                   new Date().getFullYear();
      
      const abstract = work.abstract || '';
      const authors = work.author?.map((author: { given?: string; family?: string }) => 
        `${author.given || ''} ${author.family || ''}`.trim()
      ).filter(Boolean) || [];

      return {
        title,
        journal,
        year,
        abstract,
        url: `https://doi.org/${doi}`,
        authors,
      };
    } catch (error) {
      logger.error('Crossref API error:', error);
      return null;
    }
  }

  private static async fetchFromOpenAlex(doi: string): Promise<PublicationData | null> {
    try {
      const response = await fetch(`${this.OPENALEX_API}https://doi.org/${encodeURIComponent(doi)}`);
      if (!response.ok) return null;

      const work = await response.json();
      if (!work) return null;

      const title = work.title || '';
      const journal = work.primary_location?.source?.display_name || '';
      const year = work.publication_year || new Date().getFullYear();
      const abstract = work.abstract_inverted_index ? 
        this.reconstructAbstract(work.abstract_inverted_index) : '';
      
      const authors = work.authorships?.map((authorship: { author?: { display_name?: string } }) => 
        authorship.author?.display_name
      ).filter(Boolean) || [];

      return {
        title,
        journal,
        year,
        abstract,
        url: work.doi || `https://doi.org/${doi}`,
        authors,
      };
    } catch (error) {
      logger.error('OpenAlex API error:', error);
      return null;
    }
  }

  private static async fetchFromPubMed(pmid: string): Promise<PublicationData | null> {
    try {
      // Fetch summary data
      const summaryResponse = await fetch(
        `${this.PUBMED_ESUMMARY_API}?db=pubmed&id=${pmid}&retmode=json`
      );
      
      if (!summaryResponse.ok) return null;
      
      const summaryData = await summaryResponse.json();
      const articleData = summaryData.result?.[pmid];
      
      if (!articleData) return null;

      // Fetch detailed abstract using efetch
      let abstract = '';
      try {
        const abstractResponse = await fetch(
          `${this.PUBMED_EFETCH_API}?db=pubmed&id=${pmid}&retmode=text&rettype=abstract`
        );
        if (abstractResponse.ok) {
          abstract = await abstractResponse.text();
          // Clean up the abstract text
          abstract = abstract.replace(/^\d+\.\s*/, '').trim();
        }
      } catch (abstractError) {
        logger.warn('Could not fetch abstract for PMID:', pmid);
      }

      const title = articleData.title || '';
      const journal = articleData.fulljournalname || articleData.source || '';
      const year = articleData.pubdate ? 
        parseInt(articleData.pubdate.split(' ')[0]) || new Date().getFullYear() :
        new Date().getFullYear();

      const authors = articleData.authors?.map((author: { name: string }) => 
        author.name
      ).filter(Boolean) || [];

      return {
        title: title.replace(/\.$/, ''), // Remove trailing period
        journal,
        year,
        abstract,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        authors,
      };
    } catch (error) {
      logger.error('PubMed API error:', error);
      return null;
    }
  }

  private static reconstructAbstract(invertedIndex: Record<string, number[]>): string {
    const words: [string, number][] = [];
    
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const position of positions) {
        words.push([word, position]);
      }
    }
    
    words.sort((a, b) => a[1] - b[1]);
    return words.map(([word]) => word).join(' ');
  }
}