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

  static async fetchPublicationData(doi: string): Promise<PublicationData | null> {
    if (!doi) return null;

    // Clean DOI
    const cleanDoi = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');

    try {
      // Try Crossref first (more reliable for DOI lookups)
      const crossrefData = await this.fetchFromCrossref(cleanDoi);
      if (crossrefData) return crossrefData;

      // Fallback to OpenAlex
      const openAlexData = await this.fetchFromOpenAlex(cleanDoi);
      if (openAlexData) return openAlexData;

      return null;
    } catch (error) {
      console.error('Error fetching publication data:', error);
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
      const authors = work.author?.map((author: any) => 
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
      console.error('Crossref API error:', error);
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
      
      const authors = work.authorships?.map((authorship: any) => 
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
      console.error('OpenAlex API error:', error);
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