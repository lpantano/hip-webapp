import type { Database } from '@/integrations/supabase/types';

interface ClaimRow {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  product?: string | null;
  category: Database['public']['Enums']['claim_category'];
  broad_category: Database['public']['Enums']['broad_category_type'];
  labels: string[];
  condition?: string | null;
  stage?: string | null;
  vote_count: number;
  status: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

interface PublicationRow {
  id: string;
  claim_id: string;
  title: string;
  journal?: string | null;
  publication_year?: number | null;
  doi?: string | null;
  url?: string | null;
  source?: string | null;
  authors?: string | null;
  stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
  submitted_by?: string | null;
  created_at: string;
}

interface ClaimLinkRow {
  id: string;
  claim_id: string;
  expert_user_id: string;
  title: string;
  url: string;
  description?: string | null;
  link_type?: string | null;
  created_at: string;
}

interface PublicationScoreRow {
  id: string;
  publication_id: string;
  expert_user_id: string;
  // New JSON-based schema
  review_data: {
    category?: string;
    tags?: {
      testedInHuman?: boolean;
      ethnicityLabels?: string[];
      ageRanges?: string[];
    };
    qualityChecks?: {
      studyDesign?: 'PASS' | 'NO' | 'NA' | null;
      controlGroup?: 'PASS' | 'NO' | 'NA' | null;
      biasAddressed?: 'PASS' | 'NO' | 'NA' | null;
      statistics?: 'PASS' | 'NO' | 'NA' | null;
    };
    womenNotIncluded?: boolean;
  } | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;
}

interface ClaimCommentRow {
  id: string;
  claim_id: string;
  expert_user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ClaimUI {
  id: string;
  slug: string;
  claim: string;
  user_id?: string;
  rawStatus?: string;
  // show the raw DB category value (e.g. 'nutrition', 'fitness', 'menopause', etc.)
  category: Database['public']['Enums']['claim_category'];
  broad_category: Database['public']['Enums']['broad_category_type'];
  labels?: string[];
  votes: number;
  created_at: string;
  publications: {
    id: string; // Add publication ID
    title: string;
    authors: string;
    journal: string;
    year: number;
    url: string;
    source?: string | null;
    stance?: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null;
    submitted_by?: string | null;
    // raw individual score rows so we can detect if current expert already reviewed
    rawScores?: PublicationScoreRow[];
  }[];
  links?: {
    id: string;
    title: string;
    url: string;
    description?: string | null;
    link_type?: string | null;
    expert_user_id?: string | null;
  }[];
  comments?: ClaimCommentRow[];
  // DB-backed status values (exposed directly)
  status: 'proposed' | 'pending' | 'verified' | 'disputed' | 'needs more evidence' | 'under review';
  // Evidence-based status calculated from publications and reviews
  evidence_status?: 'Awaiting Evidence' | 'Evidence Supports' | 'Evidence Disproves' | 'Inconclusive' | null;
}


export type { ClaimRow, PublicationRow, ClaimLinkRow, PublicationScoreRow, ClaimCommentRow, ClaimUI };
