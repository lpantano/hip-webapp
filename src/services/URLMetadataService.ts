interface URLMetadata {
  title?: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  sourceType?: string;
}

export class URLMetadataService {
  static async fetchMetadata(url: string): Promise<URLMetadata | null> {
    if (!url) return null;

    try {
      // First try to determine source type from URL immediately
      const sourceType = this.determineSourceType(url);
      
      // Try to fetch with different methods
      let htmlContent = '';
      
      try {
        // Try direct fetch first (will work for CORS-enabled sites)
        const directResponse = await fetch(url, { mode: 'cors' });
        if (directResponse.ok) {
          htmlContent = await directResponse.text();
        }
      } catch {
        // If direct fetch fails, try with CORS proxy
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          const proxyResponse = await fetch(proxyUrl);
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            htmlContent = data.contents;
          }
        } catch {
          // If all methods fail, return just the source type
          return { sourceType };
        }
      }
      
      if (!htmlContent) return { sourceType };

      // Parse HTML content to extract metadata
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract metadata
      const title = this.extractTitle(doc, url);
      const description = this.extractDescription(doc);
      const author = this.extractAuthor(doc);
      const publishedDate = this.extractPublishedDate(doc);

      return {
        title,
        description,
        author,
        publishedDate,
        sourceType,
      };
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
      
      // At minimum, return the source type
      try {
        return { sourceType: this.determineSourceType(url) };
      } catch {
        return null;
      }
    }
  }

  /**
   * Lightweight helper that only fetches and returns the page title.
   * Uses the same fetch + CORS-fallback strategy as fetchMetadata but
   * stops early once the title is extracted to reduce work and data.
   */
  static async fetchTitle(url: string): Promise<string | null> {
    if (!url) return null;

    try {
      const sourceType = this.determineSourceType(url);

      let htmlContent = '';

      try {
        const directResponse = await fetch(url, { mode: 'cors' });
        if (directResponse.ok) {
          htmlContent = await directResponse.text();
        }
      } catch {
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          const proxyResponse = await fetch(proxyUrl);

          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            htmlContent = data.contents;
          }
        } catch {
          // If we can't fetch HTML, return either the URL or null
          return url;
        }
      }

      if (!htmlContent) return url;

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const title = this.extractTitle(doc, url);
      return title;
    } catch (error) {
      console.error('Error fetching title:', error);
      try {
        return url;
      } catch {
        return null;
      }
    }
  }

  private static extractTitle(doc: Document, url: string): string {
    // Try Open Graph title first
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (ogTitle) return ogTitle;

    // Try Twitter title
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    if (twitterTitle) return twitterTitle;

    // Try page title
    const pageTitle = doc.querySelector('title')?.textContent;
    if (pageTitle) return pageTitle.trim();

    // Fallback to URL
    return url;
  }

  private static extractDescription(doc: Document): string {
    // Try Open Graph description
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    if (ogDescription) return ogDescription;

    // Try Twitter description
    const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    if (twitterDescription) return twitterDescription;

    // Try meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    if (metaDescription) return metaDescription;

    // Try to extract from first paragraph
    const firstParagraph = doc.querySelector('p')?.textContent;
    if (firstParagraph) return firstParagraph.substring(0, 200).trim();

    return '';
  }

  private static extractAuthor(doc: Document): string {
    // Try article author
    const articleAuthor = doc.querySelector('meta[name="author"]')?.getAttribute('content');
    if (articleAuthor) return articleAuthor;

    // Try Open Graph article author
    const ogAuthor = doc.querySelector('meta[property="article:author"]')?.getAttribute('content');
    if (ogAuthor) return ogAuthor;

    // Try byline patterns
    const bylineSelectors = [
      '[class*="author"]',
      '[class*="byline"]',
      '[class*="writer"]',
      '.by-author',
      '.author-name'
    ];

    for (const selector of bylineSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent) {
        return element.textContent.trim().replace(/^(by|author:)\s*/i, '');
      }
    }

    return '';
  }

  private static extractPublishedDate(doc: Document): string {
    // Try article published time
    const articleTime = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content');
    if (articleTime) return new Date(articleTime).toISOString().split('T')[0];

    // Try time elements
    const timeElement = doc.querySelector('time[datetime]')?.getAttribute('datetime');
    if (timeElement) return new Date(timeElement).toISOString().split('T')[0];

    // Try date patterns in text
    const dateSelectors = [
      '[class*="date"]',
      '[class*="published"]',
      '[class*="timestamp"]'
    ];

    for (const selector of dateSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent) {
        const dateMatch = element.textContent.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4}/);
        if (dateMatch) {
          try {
            return new Date(dateMatch[0]).toISOString().split('T')[0];
          } catch {
            // Invalid date format
          }
        }
      }
    }

    return '';
  }

  private static determineSourceType(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('reddit.com')) return 'reddit';
    if (hostname.includes('podcast') || hostname.includes('spotify.com') || hostname.includes('apple.com/podcasts')) return 'podcast';
    
    return 'webpage';
  }
}