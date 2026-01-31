#!/usr/bin/env python3
"""
Extract publication years from PDF files and compare with filename years.
"""

import os
import re
from pathlib import Path
from datetime import datetime
import json

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None


def extract_year_from_filename(filename):
    """Extract year from filename (e.g., '2024_Something.pdf' -> 2024)"""
    match = re.match(r'^(\d{4})', filename)
    if match:
        return int(match.group(1))
    return None


def extract_publication_year_from_pdf(pdf_path):
    """Extract publication year from PDF metadata or content"""
    year_found = None
    source = None

    # Try using pdfplumber first (usually more reliable)
    if pdfplumber:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Check metadata
                if pdf.metadata:
                    # Check CreationDate
                    if pdf.metadata.get('CreationDate'):
                        date_str = str(pdf.metadata.get('CreationDate'))
                        year_match = re.search(r'(\d{4})', date_str)
                        if year_match:
                            year_found = int(year_match.group(1))
                            source = 'metadata_creation_date'
                            return year_found, source

                    # Check ModDate
                    if pdf.metadata.get('ModDate'):
                        date_str = str(pdf.metadata.get('ModDate'))
                        year_match = re.search(r'(\d{4})', date_str)
                        if year_match:
                            year_found = int(year_match.group(1))
                            source = 'metadata_mod_date'
                            return year_found, source

                # Try to extract text from first few pages to find publication date
                text = ""
                for page_num in range(min(3, len(pdf.pages))):
                    try:
                        page_text = pdf.pages[page_num].extract_text() or ""
                        text += page_text + "\n"
                    except:
                        pass

                # Look for publication year patterns
                # Common patterns: "Published in 20XX", "© 20XX", "20XX", etc.
                patterns = [
                    r'(?:Published|Publication Date|Year|Copyright)[\s:]*(\d{4})',
                    r'©\s*(\d{4})',
                    r'\b(20\d{2})\b',
                ]

                for pattern in patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    if matches:
                        for match in matches:
                            year = int(match)
                            if 1950 <= year <= datetime.now().year + 1:
                                year_found = year
                                source = 'content_pattern'
                                return year_found, source
        except Exception as e:
            pass

    # Fallback: Try using pypdf
    if PdfReader and not year_found:
        try:
            reader = PdfReader(pdf_path)

            # Check metadata
            if reader.metadata:
                if '/CreationDate' in reader.metadata:
                    date_str = str(reader.metadata['/CreationDate'])
                    year_match = re.search(r'(\d{4})', date_str)
                    if year_match:
                        year_found = int(year_match.group(1))
                        source = 'pypdf_creation_date'
                        return year_found, source

            # Try to extract text from first page
            if len(reader.pages) > 0:
                try:
                    text = reader.pages[0].extract_text() or ""

                    # Look for year patterns
                    patterns = [
                        r'(?:Published|Publication Date|Year)[\s:]*(\d{4})',
                        r'©\s*(\d{4})',
                        r'\b(20\d{2})\b',
                    ]

                    for pattern in patterns:
                        matches = re.findall(pattern, text, re.IGNORECASE)
                        if matches:
                            for match in matches:
                                year = int(match)
                                if 1950 <= year <= datetime.now().year + 1:
                                    year_found = year
                                    source = 'pypdf_content'
                                    return year_found, source
                except:
                    pass
        except Exception as e:
            pass

    return year_found, source


def analyze_papers(papers_dir):
    """Analyze all PDF files in the papers directory"""
    results = []
    papers_path = Path(papers_dir)

    # Get all PDF files
    pdf_files = sorted([f for f in papers_path.glob('*.pdf')])

    print(f"Found {len(pdf_files)} PDF files\n")
    print("=" * 100)
    print(f"{'Filename':<60} | {'Filename Year':<13} | {'PDF Year':<8} | {'Source':<25} | {'Status'}")
    print("=" * 100)

    for pdf_file in pdf_files:
        filename = pdf_file.name
        filename_year = extract_year_from_filename(filename)

        # Extract year from PDF
        pdf_year, source = extract_publication_year_from_pdf(str(pdf_file))

        # Determine status
        if filename_year and pdf_year:
            status = "MATCH" if filename_year == pdf_year else "MISMATCH"
        elif filename_year and not pdf_year:
            status = "NO PDF YEAR"
        elif pdf_year and not filename_year:
            status = "NO FILENAME YEAR"
        else:
            status = "UNABLE TO EXTRACT"

        # Format output
        filename_display = filename[:57] + "..." if len(filename) > 60 else filename
        source_display = source or "N/A"
        pdf_year_display = str(pdf_year) if pdf_year else "N/A"
        filename_year_display = str(filename_year) if filename_year else "N/A"

        print(f"{filename_display:<60} | {filename_year_display:<13} | {pdf_year_display:<8} | {source_display:<25} | {status}")

        results.append({
            'filename': filename,
            'filename_year': filename_year,
            'pdf_year': pdf_year,
            'source': source,
            'status': status
        })

    print("=" * 100)

    # Summary
    mismatches = [r for r in results if r['status'] == 'MISMATCH']
    no_pdf_year = [r for r in results if r['status'] == 'NO PDF YEAR']

    print(f"\nSUMMARY:")
    print(f"Total PDFs: {len(results)}")
    print(f"Matches: {len(results) - len(mismatches) - len(no_pdf_year)}")
    print(f"Mismatches: {len(mismatches)}")
    print(f"Cannot extract PDF year: {len(no_pdf_year)}")

    if mismatches:
        print(f"\nMISMATCHES DETECTED:")
        for m in mismatches:
            print(f"  - {m['filename']}: Filename={m['filename_year']}, PDF={m['pdf_year']}")

    if no_pdf_year:
        print(f"\nCannot extract PDF year from:")
        for m in no_pdf_year:
            print(f"  - {m['filename']}")

    return results


if __name__ == '__main__':
    papers_dir = '/Users/lpantano/Code/Apps/evidence-decoded/company/science/papers/'

    if not os.path.exists(papers_dir):
        print(f"Error: Papers directory not found: {papers_dir}")
        exit(1)

    results = analyze_papers(papers_dir)

    # Save results to JSON
    output_file = '/Users/lpantano/Code/Apps/evidence-decoded/scripts/pdf_year_analysis.json'
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nDetailed results saved to: {output_file}")
