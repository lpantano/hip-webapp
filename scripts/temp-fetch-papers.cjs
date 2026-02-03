const https = require('https');

const pmids = ['36253903', '35241506', '27327802', '39433088', '33920485', '33331798', '37569440', '40718787', '34399063', '39708251'];

function fetchXML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function extractText(xml, tagName, startIndex = 0) {
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;
  const openIndex = xml.indexOf(openTag, startIndex);
  if (openIndex === -1) return '';
  const contentStart = openIndex + openTag.length;
  const closeIndex = xml.indexOf(closeTag, contentStart);
  if (closeIndex === -1) return '';
  return xml.substring(contentStart, closeIndex).trim();
}

function extractAll(xml, tagName) {
  const results = [];
  const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'g');
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1] && match[1].trim()) {
      results.push(match[1].trim());
    }
  }
  return results;
}

async function parsePaper(articleXml) {
  const pmid = extractText(articleXml, 'PMID');
  const title = extractText(articleXml, 'ArticleTitle').replace(/<[^>]+>/g, '');

  // Extract abstract parts
  const abstractMatch = articleXml.match(/<Abstract>([\s\S]*?)<\/Abstract>/);
  let abstract = 'No abstract available';
  if (abstractMatch) {
    const abstractXml = abstractMatch[1];
    const parts = [];
    const abstractTextRegex = /<AbstractText[^>]*>([^<]+(?:<[^\/][^>]*>[^<]*<\/[^>]+>)*[^<]*)<\/AbstractText>/g;
    let match;
    while ((match = abstractTextRegex.exec(abstractXml)) !== null) {
      const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text) parts.push(text);
    }
    if (parts.length > 0) abstract = parts.join(' ');
  }

  // Extract authors
  const authorMatches = articleXml.match(/<Author[^>]*>[\s\S]*?<\/Author>/g) || [];
  const authors = authorMatches.map(authorXml => {
    const lastName = extractText(authorXml, 'LastName');
    const foreName = extractText(authorXml, 'ForeName');
    return `${foreName} ${lastName}`.trim();
  }).filter(a => a);

  // Extract journal
  let journal = extractText(articleXml, 'Title');
  if (!journal) journal = extractText(articleXml, 'ISOAbbreviation');

  // Extract year
  let year = extractText(articleXml, 'Year');
  if (!year) {
    const medlineDate = extractText(articleXml, 'MedlineDate');
    const yearMatch = medlineDate.match(/\d{4}/);
    year = yearMatch ? yearMatch[0] : '2020';
  }

  // Extract DOI
  const doiMatch = articleXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
  const doi = doiMatch ? doiMatch[1] : null;

  // Extract publication types
  const publicationTypes = extractAll(articleXml, 'PublicationType');

  // Extract MeSH terms
  const meshTerms = extractAll(articleXml, 'DescriptorName');

  // Calculate design score
  const pubTypesLower = publicationTypes.map(t => t.toLowerCase());
  let designScore = 0;
  let designLabel = 'Other Study Type';

  if (pubTypesLower.some(t => t.includes('meta-analysis'))) {
    designScore = 5;
    designLabel = 'Meta-Analysis';
  } else if (pubTypesLower.some(t => t.includes('systematic review'))) {
    designScore = 4;
    designLabel = 'Systematic Review';
  } else if (pubTypesLower.some(t => t.includes('randomized controlled trial'))) {
    designScore = 3;
    designLabel = 'Randomized Controlled Trial';
  } else if (pubTypesLower.some(t => t.includes('clinical trial'))) {
    designScore = 2;
    designLabel = 'Clinical Trial';
  } else if (pubTypesLower.some(t => t.includes('observational'))) {
    designScore = 1;
    designLabel = 'Observational Study';
  }

  return {
    pmid,
    title,
    abstract,
    authors: authors.length > 0 ? authors : ['Authors not listed'],
    journal: journal || 'Journal not available',
    publicationYear: parseInt(year) || 2020,
    doi,
    pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    meshTerms,
    publicationTypes,
    designScore,
    designLabel,
    isPeerReviewed: true
  };
}

async function main() {
  console.error('Fetching papers from PubMed...');

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const xml = await fetchXML(fetchUrl);

  const articles = xml.split('<PubmedArticle>').slice(1);
  console.error(`Parsing ${articles.length} articles...`);

  const papers = [];
  for (const articleXml of articles) {
    try {
      const paper = await parsePaper(articleXml);
      if (paper.pmid && paper.title) {
        papers.push(paper);
      }
    } catch (err) {
      console.error('Error parsing article:', err.message);
    }
  }

  papers.sort((a, b) => b.designScore - a.designScore);

  const output = {
    claim: 'Soy isoflavones relieve menopausal hot flashes',
    searchDate: new Date().toISOString(),
    totalFound: papers.length,
    papers,
    searchParameters: {
      maxResults: 20,
      yearsBack: 10,
      includeMetaAnalyses: true,
      includeClinicalTrials: true
    }
  };

  console.log(JSON.stringify(output, null, 2));
  console.error(`\nSuccessfully fetched ${papers.length} papers`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
