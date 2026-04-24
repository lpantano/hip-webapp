import { supabase } from './supabase';
import type { ClaimEvidenceData, Publication, PublicationScore, ExpertProfile } from './types';

export async function getAllClaimSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('slug')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch claim slugs: ${error.message}`);
  return (data ?? []).map((c) => c.slug).filter(Boolean);
}

export async function getClaimEvidence(slug: string): Promise<ClaimEvidenceData | null> {
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .select('id, slug, title, description, broad_category, evidence_status, updated_at')
    .eq('slug', slug)
    .single();

  if (claimError || !claim) return null;

  const [pubResult] = await Promise.all([
    supabase.from('publications').select('*').eq('claim_id', claim.id),
    supabase.from('claim_links').select('id, url, title, description').eq('claim_id', claim.id),
  ]);

  const publications: Publication[] = (pubResult.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    journal: p.journal ?? null,
    publication_year: p.publication_year ?? null,
    url: p.url ?? null,
    doi: p.doi ?? null,
    stance: p.stance as Publication['stance'],
  }));

  const pubIds = publications.map((p) => p.id);
  let scores: PublicationScore[] = [];
  let experts: ExpertProfile[] = [];

  if (pubIds.length > 0) {
    const { data: scoreRows } = await supabase
      .from('publication_scores')
      .select('id, publication_id, expert_user_id, comments, review_data')
      .in('publication_id', pubIds);

    scores = (scoreRows ?? []) as PublicationScore[];

    const expertIds = [...new Set(scores.map((s) => s.expert_user_id))];
    if (expertIds.length > 0) {
      const { data: expertRows } = await supabase
        .from('expert_stats')
        .select('user_id, display_name, avatar_url')
        .in('user_id', expertIds);

      experts = (expertRows ?? []) as ExpertProfile[];
    }
  }

  return {
    ...claim,
    publications,
    scores,
    experts,
  };
}
