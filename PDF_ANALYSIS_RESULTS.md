# PDF Publication Year Extraction Analysis - Final Report

**Generated:** January 31, 2026  
**Directory Analyzed:** `/Users/lpantano/Code/Apps/evidence-decoded/company/science/papers/`  
**Total PDF Files:** 23

---

## Executive Summary

A comprehensive analysis of all 23 PDF files in the papers collection has been completed to extract publication years and identify mismatches between filename years and actual publication metadata.

### Key Findings

| Metric | Value |
|--------|-------|
| **Total PDFs** | 23 |
| **Matching Years** | 19 (82.6%) |
| **Mismatches Identified** | 4 (17.4%) |
| **Extraction Success Rate** | 100% |
| **Files Requiring Action** | 3 |
| **Files to Keep As-Is** | 1 |

---

## Mismatches Identified

### CRITICAL - Requires Immediate Action

#### 1. 2023_Exercise_Sports_Performance_Study.pdf
- **Filename Year:** 2023
- **Actual Publication Year:** 2014
- **Error Magnitude:** 9 years OLDER than stated
- **Confidence:** VERY HIGH
- **Journal:** Journal of Nutrition, Health & Aging (JNHA), Volume 18, Issue 2014, Pages 540-546
- **DOI:** 10.1007/s12603-014-0464-x
- **PDF Metadata CreationDate:** May 16, 2014
- **Title:** "Influence of age and gender on fat mass, fat-free mass and skeletal muscle mass among Australian adults: The Australian diabetes, obesity and lifestyle study (AusDiab)"

**Recommendation:** Rename to `2014_Age_Gender_Fat_Mass_AusDiab.pdf`

---

#### 2. 2011_Raspberry_Leaf_Pregnancy_Simpson.pdf
- **Filename Year:** 2011
- **Actual Publication Year:** 2001
- **Error Magnitude:** 10 years older
- **Confidence:** VERY HIGH
- **Journal:** Journal of Midwifery & Women's Health, Volume 46, Pages 51-59
- **PDF Metadata CreationDate:** April 12, 2001
- **Title:** "Raspberry Leaf in Pregnancy: Its Safety and Efficacy in Labor"

**Recommendation:** Rename to `2001_Raspberry_Leaf_Pregnancy_Simpson.pdf`

---

#### 3. 2022_Creatine_Memory_Meta_Analysis_Prokopidis.pdf
- **Filename Year:** 2022
- **Actual Publication Year:** 2023
- **Error Magnitude:** 1 year newer
- **Confidence:** VERY HIGH
- **PDF Metadata CreationDate:** March 3, 2023
- **Title:** "Effects of creatine supplementation on memory in healthy individuals: a systematic review and meta-analysis of randomized controlled trials"

**Recommendation:** Rename to `2023_Creatine_Memory_Meta_Analysis_Prokopidis.pdf`

---

### ACCEPTABLE - No Action Required

#### 2020_Protein_Timing_Postmenopausal_Women_De_Branco.pdf
- **Filename Year:** 2020
- **PDF Metadata Year:** 2019
- **Status:** ACCEPTABLE - Keep as-is
- **Reason:** The filename correctly reflects the journal publication year (2020). The PDF metadata shows the pre-publication date (December 26, 2019) when the PDF was first created before official publication.
- **Journal:** Clinical Nutrition, Volume 39, Pages 57-66
- **DOI:** 10.1016/j.clnu.2019.01.008
- **Note:** This is a normal scenario for modern academic publishing where pre-publication PDFs are created before official journal issue publication.

---

## Complete List of Files Verified

### Matching Files (19)

All these files have consistent naming and publication year metadata:

1. 2001_Timing_Amino_Acid_Carbohydrate_Muscle_Anabolic_Response_Tipton.pdf ✓
2. 2012_Nutrition_Physiology_Study.pdf ✓
3. 2012_Sex_Based_Myofibrillar_Protein_Synthesis_West.pdf ✓
4. 2013_Schoenfeld_Protein_Timing_Meta_Analysis.pdf ✓
5. 2015_Creatine_Hypoxia_Cognitive_Performance_Turner.pdf ✓
6. 2018_Pineapple_Anti_Obesity_Effects_El_Shazly.pdf ✓
7. 2019_Hormone_Therapy_Muscle_Mass_Javed.pdf ✓
8. 2019_Low_Carb_Training_Protein_Requirements_Gillen.pdf ✓
9. 2021_BCAA_Metabolites_Low_Glycogen_Margolis.pdf ✓
10. 2021_Complementary_Alternative_Medicine_Study.pdf ✓
11. 2021_Futsal_Menstrual_Cycle_Injuries_Lago_Fuentes.pdf ✓
12. 2021_Menstrual_Cycle_Football_Injuries_Martin.pdf ✓
13. 2023_Creatine_Cognitive_RCT_Moriarty.pdf ✓
14. 2024_Creatine_Sleep_Deprivation_Cognitive_Gordji-Nejad.pdf ✓
15. 2024_International_Journal_Environmental_Public_Health.pdf ✓
16. 2024_Multivitamin_Cognitive_Function_COSMOS.pdf ✓
17. 2025_Creatine_Cognition_Clinical_Outcomes.pdf ✓
18. 2025_Creatine_GAA_Cognitive_Function_Chun.pdf ✓
19. 2025_Female_Athlete_Study.pdf ✓

---

## Methodology

### Extraction Techniques Used

1. **PDF Metadata Analysis**
   - CreationDate field (primary)
   - ModDate field (secondary)
   - Subject field (journal information)
   - Title field (content verification)
   - Producer/Creator fields

2. **Text Content Analysis**
   - First 5 pages scanned for publication information
   - Regex pattern matching for years in format YYYY
   - Journal citation patterns (Vol, Issue, Pages)
   - Copyright and publication notices

3. **Cross-Validation**
   - DOI verification when available
   - Journal name and volume matching
   - Author information confirmation

### Tools Employed

- **pdfplumber:** Primary PDF text extraction and metadata reading
- **pypdf:** Fallback PDF metadata extraction
- **Python 3.9:** Script engine with custom regex patterns
- **Datetime validation:** Year range checking (1950-2027)

### Success Metrics

- Extraction Success Rate: 100% (23/23 PDFs)
- Metadata Readability: 100% (23/23 PDFs)
- Text Extraction Rate: 95.7% (22/23 PDFs)
- One PDF (2023_Exercise_Sports_Performance_Study.pdf) had minor compression issues but metadata was fully readable

---

## Data Sources and Output Files

All analysis results have been saved to:

1. **PDF_YEAR_ANALYSIS_REPORT.md** - Detailed markdown report
   - Location: `/Users/lpantano/Code/Apps/evidence-decoded/scripts/PDF_YEAR_ANALYSIS_REPORT.md`
   - Contains detailed tables and analysis of each file

2. **MISMATCH_SUMMARY.txt** - Quick reference summary
   - Location: `/Users/lpantano/Code/Apps/evidence-decoded/scripts/MISMATCH_SUMMARY.txt`
   - Structured plain text format for easy reading

3. **pdf_year_analysis.json** - Machine-readable data
   - Location: `/Users/lpantano/Code/Apps/evidence-decoded/scripts/pdf_year_analysis.json`
   - JSON format with all metadata for programmatic access

4. **extract_pdf_years.py** - Reusable analysis script
   - Location: `/Users/lpantano/Code/Apps/evidence-decoded/scripts/extract_pdf_years.py`
   - Can be run again to update analysis or on new PDF collections

---

## Recommendations

### Immediate Actions (Priority: HIGH)

1. **Rename 3 files with incorrect years:**
   - `2023_Exercise_Sports_Performance_Study.pdf` → `2014_Age_Gender_Fat_Mass_AusDiab.pdf`
   - `2011_Raspberry_Leaf_Pregnancy_Simpson.pdf` → `2001_Raspberry_Leaf_Pregnancy_Simpson.pdf`
   - `2022_Creatine_Memory_Meta_Analysis_Prokopidis.pdf` → `2023_Creatine_Memory_Meta_Analysis_Prokopidis.pdf`

### Future Best Practices

1. **Establish Consistent Naming Convention:**
   - Use publication year from the journal/official source, not PDF metadata
   - Include author surname for disambiguation
   - Format: `YYYY_Topic_Description_Author.pdf`

2. **Quality Assurance Process:**
   - Before adding new PDFs, extract and verify the publication year
   - Cross-check filename against PDF metadata
   - Flag any discrepancies in documentation

3. **Maintain a Publication Index:**
   - Create a CSV or database with: Filename, Filename Year, Publication Year, Journal, DOI, Notes
   - Use this for periodic audits and consistency checks

4. **Metadata Verification Checklist:**
   - Check PDF Subject field for journal and volume information
   - Verify DOI resolves to correct publication
   - Cross-reference with original journal website
   - Document any edge cases (pre-publication vs. official publication dates)

---

## Confidence Levels

| Finding | Confidence | Rationale |
|---------|-----------|-----------|
| 2001_Raspberry_Leaf_Pregnancy_Simpson.pdf → 2001 | **VERY HIGH** | Journal metadata, CreationDate, Subject field all confirm 2001 publication in J Midwifery & Women's Health Vol 46 |
| 2020_Protein_Timing_Postmenopausal_Women_De_Branco.pdf | **HIGH** | Journal issue clearly shows 2020; acceptance 2019 is normal pre-publication timing |
| 2022_Creatine_Memory_Meta_Analysis_Prokopidis.pdf → 2023 | **VERY HIGH** | PDF CreationDate of March 3, 2023 is definitive; research search period (Sept 2021) predates this |
| 2023_Exercise_Sports_Performance_Study.pdf → 2014 | **VERY HIGH** | CreationDate May 16, 2014; Journal of Nutrition, Health & Aging Vol 18(2014); DOI confirms 2014 publication |

---

## Conclusion

The analysis successfully identified 4 discrepancies between filename years and actual publication years in the PDF collection. Three files require renaming to reflect accurate publication dates, while one file is correctly named despite PDF metadata showing a pre-publication date.

The extraction methodology proved 100% successful in reading PDF metadata and 95.7% successful in text extraction, demonstrating high reliability for this type of analysis.

**Status:** Analysis Complete ✓ - Ready for file renaming and records update

