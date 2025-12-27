/**
 * One-Time Population Script for Claim Labels
 *
 * This script:
 * 1. Fetches all claims from the database
 * 2. Analyzes titles and descriptions to infer appropriate labels
 * 3. Updates the labels column with inferred labels
 *
 * Run with: tsx scripts/populate-claim-labels.ts
 * Dry run: tsx scripts/populate-claim-labels.ts --dry-run
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Make sure your .env.local file exists and contains these variables.');
  console.error('Note: This script requires the service role key to bypass RLS policies.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check for dry-run flag
const isDryRun = process.argv.includes('--dry-run');

/**
 * Label inference rules
 * Maps keywords/phrases to labels
 */
const labelKeywords: Record<string, string[]> = {
  // Reproductive & Lifecycle
  'pregnancy': ['pregnan', 'prenatal', 'gestation', 'expecting', 'trimester'],
  'fertility': ['fertil', 'conception', 'ovulat', 'ivf', 'infertil'],
  'contraception': ['birth control', 'contracepti', 'pill', 'iud', 'condom'],
  'menstruation': ['period', 'menstrua', 'cycle', 'pms', 'cramp'],
  'perimenopause': ['perimeno'],
  'menopause': ['menopaus', 'hot flash', 'hot flush'],
  'postmenopause': ['postmeno', 'post-meno'],
  'breastfeeding': ['breastfeed', 'breast feed', 'lactation', 'nursing'],
  'sexual-health': ['sexual health', 'libido', 'arousal', 'intercourse'],
  'pelvic-floor': ['pelvic floor', 'kegel', 'incontinence'],

  // Nutrition & Diet
  'nutrition': ['nutrition', 'nutrient', 'vitamin', 'mineral'],
  'diet': ['diet', 'eating', 'food', 'meal'],
  'supplements': ['supplement', 'multivitamin', 'omega-3', 'probiotic', 'turmeric'],
  'hydration': ['hydrat', 'water', 'fluid'],

  // Physical Health & Fitness
  'fitness': ['fitness', 'training', 'workout', 'gym', 'muscle', 'plunges'],
  'exercise': ['exercise', 'physical activity', 'cardio', 'aerobic', 'running', 'walking', 'yoga'],
  'weight-management': ['weight', 'obesity', 'bmi', 'overweight', 'weight loss', 'weight gain'],
  'sleep': ['sleep', 'insomnia', 'rest', 'fatigue'],
  'energy': ['energy', 'stamina', 'vigor', 'vitality'],

  // Body Systems
  'bone-health': ['bone', 'osteoporo', 'calcium', 'fracture', 'skeletal'],
  'heart-health': ['heart', 'cardiovascular', 'cardiac', 'blood pressure', 'cholesterol'],
  'hormone-health': ['hormone', 'estrogen', 'progesterone', 'testosterone', 'endocrine'],
  'thyroid': ['thyroid', 'hypothyroid', 'hyperthyroid'],
  'gut-health': ['gut', 'digestive', 'intestinal', 'microbiome', 'ibs'],
  'skin-health': ['skin', 'derma', 'acne', 'wrinkle', 'aging skin'],
  'immunity': ['immune', 'immunity', 'antibod', 'infection'],
  'inflammation': ['inflammat', 'inflammatory', 'anti-inflammatory'],

  // Mental & Cognitive Health
  'mental-health': ['mental health', 'wellbeing', 'well-being', 'depression'],
  'cognitive-health': ['cognitive', 'memory', 'brain', 'dementia', 'alzheimer'],
  'stress': ['stress', 'cortisol', 'burnout'],
  'mood': ['mood', 'emotional'],
  'anxiety': ['anxiety', 'anxious', 'worry'],

  // General
  'general-health': ['health', 'wellness', 'disease prevention'],
  'chronic-pain': ['chronic pain', 'fibromyalgia', 'arthritis'],
  'aging': ['aging', 'ageing', 'longevity', 'anti-aging'],
};

/**
 * Infer labels from claim title and description
 */
function inferLabels(title: string, description: string | null): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  const inferredLabels: string[] = [];

  for (const [label, keywords] of Object.entries(labelKeywords)) {
    // Check if any keyword matches
    const matches = keywords.some(keyword => text.includes(keyword.toLowerCase()));
    if (matches) {
      inferredLabels.push(label);
    }
  }

  return inferredLabels;
}

async function populateClaimLabels() {
  console.log('Starting claim labels population...');
  console.log(isDryRun ? '⚠️  DRY RUN MODE - No changes will be saved\n' : '✓ LIVE MODE - Changes will be saved\n');

  // Fetch all claims
  const { data: claims, error } = await supabase
    .from('claims')
    .select('id, title, description, labels')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching claims:', error);
    return;
  }

  if (!claims || claims.length === 0) {
    console.log('No claims found in database.');
    return;
  }

  console.log(`Processing ${claims.length} claims...\n`);

  // Track statistics
  let processedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const labelCounts: Record<string, number> = {};

  // Process each claim
  for (const claim of claims) {
    try {
      processedCount++;

      // Skip if labels already exist (unless you want to override)
      const hasExistingLabels = claim.labels && claim.labels.length > 0;

      // Infer labels
      const inferredLabels = inferLabels(claim.title || '', claim.description);

      if (inferredLabels.length === 0) {
        console.log(`⊘ [${claim.id.substring(0, 8)}...] No labels inferred: "${claim.title?.substring(0, 60) || 'Untitled'}"`);
        skippedCount++;
        continue;
      }

      // Count label occurrences
      inferredLabels.forEach(label => {
        labelCounts[label] = (labelCounts[label] || 0) + 1;
      });

      const labelStr = inferredLabels.join(', ');
      const statusIcon = hasExistingLabels ? '↻' : '✓';
      const statusText = hasExistingLabels ? 'UPDATE' : 'NEW';

      if (hasExistingLabels) {
        console.log(`${statusIcon} [${claim.id.substring(0, 8)}...] ${statusText} [${inferredLabels.length} labels]: "${claim.title?.substring(0, 50) || 'Untitled'}"`);
        console.log(`   Old: [${claim.labels.join(', ')}]`);
        console.log(`   New: [${labelStr}]`);
      } else {
        console.log(`${statusIcon} [${claim.id.substring(0, 8)}...] ${statusText} [${inferredLabels.length} labels]: "${claim.title?.substring(0, 50) || 'Untitled'}"`);
        console.log(`   Labels: [${labelStr}]`);
      }

      // Update the database (unless dry run)
      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('claims')
          .update({ labels: inferredLabels })
          .eq('id', claim.id);

        if (updateError) throw updateError;
      }

      updatedCount++;

    } catch (err) {
      console.error(`✗ Failed to update claim ${claim.id}:`, err);
      errorCount++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes saved)' : 'LIVE (changes saved)'}`);
  console.log(`Total claims processed: ${processedCount}`);
  console.log(`Claims updated: ${updatedCount}`);
  console.log(`Claims skipped (no labels inferred): ${skippedCount}`);
  console.log(`Failed updates: ${errorCount}`);

  console.log('\nLabel Distribution:');
  const sortedLabels = Object.entries(labelCounts).sort(([, a], [, b]) => b - a);
  sortedLabels.forEach(([label, count]) => {
    const percentage = ((count / updatedCount) * 100).toFixed(1);
    console.log(`  ${label.padEnd(25)}: ${count.toString().padStart(3)} (${percentage}%)`);
  });
  console.log('='.repeat(70));

  if (isDryRun) {
    console.log('\n💡 To apply these changes, run: tsx scripts/populate-claim-labels.ts');
  }
}

// Run the script
populateClaimLabels()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });
