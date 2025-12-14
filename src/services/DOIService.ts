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
  private static readonly ID_CONVERTER_API = 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/';

  static async fetchPublicationData(input: string): Promise<PublicationData | null> {
    if (!input) return null;

    const parsed = this.parseInput(input);
    if (!parsed) return null;

    try {
      if (parsed.type === 'PMID') {
        return await this.fetchFromPubMed(parsed.id);
      }

      if (parsed.type === 'PMC') {
        const pmid = await this.convertPMCToPMID(parsed.id);
        if (pmid) {
          return await this.fetchFromPubMed(pmid);
        }
        // If conversion fails, we could try OpenAlex with PMC ID
        // But for now, let's rely on conversion as it's most reliable for PubMed content
      }

      if (parsed.type === 'DOI') {
        // Try Crossref first (more reliable for DOI lookups)
        const crossrefData = await this.fetchFromCrossref(parsed.id);
        if (crossrefData) return crossrefData;

        // Fallback to OpenAlex
        const openAlexData = await this.fetchFromOpenAlex(parsed.id);
        if (openAlexData) return openAlexData;
      }

      return null;
    } catch (error) {
      logger.error('Error fetching publication data:', error);
      return null;
    }
  }

  private static parseInput(input: string): { type: 'DOI' | 'PMID' | 'PMC', id: string } | null {
    const clean = input.trim();

    // 1. Check for URLs
    // PubMed URL
    const pubmedUrlMatch = clean.match(/(?:pubmed\.ncbi\.nlm\.nih\.gov|ncbi\.nlm\.nih\.gov\/pubmed)\/(\d+)/i);
    if (pubmedUrlMatch) return { type: 'PMID', id: pubmedUrlMatch[1] };

    // PMC URL
    const pmcUrlMatch = clean.match(/ncbi\.nlm\.nih\.gov\/pmc\/articles\/(PMC\d+)/i);
    if (pmcUrlMatch) return { type: 'PMC', id: pmcUrlMatch[1] };

    // DOI URL
    const doiUrlMatch = clean.match(/(?:doi\.org|dx\.doi\.org)\/(10\.\d{4,}\/[^#\s]+)/i);
    if (doiUrlMatch) return { type: 'DOI', id: doiUrlMatch[1] };

    // 2. Check for explicit IDs with prefixes or raw formats
    
    // DOI (starts with 10.)
    const doiMatch = clean.match(/^(?:doi:?\s*)?(10\.\d{4,}\/[^#\s]+)$/i);
    if (doiMatch) return { type: 'DOI', id: doiMatch[1] };

    // PMC ID (PMC12345 or PMC: 12345)
    // Matches "PMC12345", "PMC:12345", "PMC 12345"
    const pmcMatch = clean.match(/^(?:PMC:?\s*)?(PMC\d+)|(?:PMC:?\s*)(\d+)$/i);
    if (pmcMatch) {
      // If matched group 1 (PMC12345), use it. If group 2 (12345), prepend PMC.
      const id = pmcMatch[1] || `PMC${pmcMatch[2]}`;
      return { type: 'PMC', id: id.toUpperCase() };
    }

    // PMID (12345 or PMID: 12345)
    const pmidMatch = clean.match(/^(?:PMID:?\s*)?(\d+)$/i);
    if (pmidMatch) return { type: 'PMID', id: pmidMatch[1] };

    return null;
  }

  private static async convertPMCToPMID(pmcId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.ID_CONVERTER_API}?tool=evidence-decoded&email=evidence-decoded@example.com&ids=${pmcId}&format=json`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        if (record.pmid) return record.pmid;
      }
      
      return null;
    } catch (error) {
      logger.error('Error converting PMC to PMID:', error);
      return null;
    }
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