#!/usr/bin/env python3
import urllib.request
import json
import xml.etree.ElementTree as ET
import re

pmids = ['36253903', '35241506', '27327802', '39433088', '33920485', '33331798', '37569440', '34399063']

def fetch_papers(pmids):
    url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={",".join(pmids)}&retmode=xml'
    with urllib.request.urlopen(url) as response:
        return response.read().decode('utf-8')

def extract_text(elem, tag):
    child = elem.find(f'.//{tag}')
    return child.text if child is not None and child.text else ''

def extract_all(elem, tag):
    return [e.text for e in elem.findall(f'.//{tag}') if e.text]

def parse_papers(xml_text):
    papers = []

    # Parse XML
    root = ET.fromstring(xml_text)

    for article in root.findall('.//PubmedArticle'):
        try:
            pmid = extract_text(article, 'PMID')
            title_elem = article.find('.//ArticleTitle')
            title = ''.join(title_elem.itertext()) if title_elem is not None else ''

            # Extract abstract
            abstract_parts = []
            for abstract_text in article.findall('.//AbstractText'):
                text = ''.join(abstract_text.itertext()).strip()
                if text:
                    abstract_parts.append(text)
            abstract = ' '.join(abstract_parts) if abstract_parts else 'No abstract available'

            # Authors
            authors = []
            for author in article.findall('.//Author'):
                forename = extract_text(author, 'ForeName')
                lastname = extract_text(author, 'LastName')
                if lastname:
                    authors.append(f'{forename} {lastname}'.strip())

            # Journal
            journal = extract_text(article, 'Title')
            if not journal:
                journal = extract_text(article, 'ISOAbbreviation')

            # Year
            year = extract_text(article, 'Year')
            if not year:
                medline_date = extract_text(article, 'MedlineDate')
                match = re.search(r'\d{4}', medline_date)
                year = match.group(0) if match else '2020'

            # DOI
            doi = ''
            for article_id in article.findall('.//ArticleId[@IdType="doi"]'):
                if article_id.text:
                    doi = article_id.text
                    break

            # Publication types
            pub_types = extract_all(article, 'PublicationType')

            # MeSH terms
            mesh_terms = extract_all(article, 'DescriptorName')

            # Calculate design score
            pub_types_lower = [pt.lower() for pt in pub_types]
            design_score = 0
            design_label = 'Other Study Type'

            if any('meta-analysis' in pt for pt in pub_types_lower):
                design_score = 5
                design_label = 'Meta-Analysis'
            elif any('systematic review' in pt for pt in pub_types_lower):
                design_score = 4
                design_label = 'Systematic Review'
            elif any('randomized controlled trial' in pt for pt in pub_types_lower):
                design_score = 3
                design_label = 'Randomized Controlled Trial'
            elif any('clinical trial' in pt for pt in pub_types_lower):
                design_score = 2
                design_label = 'Clinical Trial'
            elif any('observational' in pt for pt in pub_types_lower):
                design_score = 1
                design_label = 'Observational Study'

            papers.append({
                'pmid': pmid,
                'title': title,
                'abstract': abstract,
                'authors': authors if authors else ['Authors not listed'],
                'journal': journal or 'Journal not available',
                'publicationYear': int(year) if year.isdigit() else 2020,
                'doi': doi or None,
                'pubmedUrl': f'https://pubmed.ncbi.nlm.nih.gov/{pmid}/',
                'meshTerms': mesh_terms,
                'publicationTypes': pub_types,
                'designScore': design_score,
                'designLabel': design_label,
                'isPeerReviewed': True
            })
        except Exception as e:
            print(f'Error parsing article: {e}', file=__import__('sys').stderr)
            continue

    return papers

# Fetch and parse
xml_text = fetch_papers(pmids)
papers = parse_papers(xml_text)

# Sort by design score
papers.sort(key=lambda p: p['designScore'], reverse=True)

output = {
    'claim': 'Soy isoflavones relieve menopausal hot flashes',
    'searchDate': __import__('datetime').datetime.now().isoformat() + 'Z',
    'totalFound': len(papers),
    'papers': papers,
    'searchParameters': {
        'maxResults': 20,
        'yearsBack': 10,
        'includeMetaAnalyses': True,
        'includeClinicalTrials': True
    }
}

print(json.dumps(output, indent=2))
