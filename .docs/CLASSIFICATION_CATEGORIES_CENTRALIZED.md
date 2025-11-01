# Classification Categories - Centralized Configuration

## Overview

All classification category definitions, colors, and explanations are now centralized in a single source of truth: `/src/lib/classification-categories.ts`

This makes it easy to update categories, add new ones, or change colors consistently across the entire application.

## What's Centralized

### 1. Category Definitions
- `CLASSIFICATION_CATEGORIES` - All available categories in priority order
- `PROBLEMATIC_CATEGORIES` - Categories that need reasons/explanations (Misinformation, Invalid, Inconclusive)

### 2. Color Mappings
- `CATEGORY_BACKGROUND_COLORS` - Background colors for badges
- `CATEGORY_BORDER_COLORS` - Border colors for outlined badges

### 3. Descriptions & Labels
- `CATEGORY_DESCRIPTIONS` - Human-readable descriptions
- `CATEGORY_SHORT_LABELS` - Short labels for compact UI

### 4. Helper Functions
- `getCategoryBackgroundColor()` - Get background color classes
- `getCategoryBorderColor()` - Get border color classes
- `getCategoryDescription()` - Get description text
- `getCategoryShortLabel()` - Get short label
- `isProblematicCategory()` - Check if category needs reasons
- `isHumanTestingCategory()` - Check if it's a human testing category
- `getCategoryPriority()` - Get sorting priority
- `compareCategoriesByPriority()` - Compare function for sorting

## Usage Examples

### Import the configuration

```typescript
import {
  CLASSIFICATION_CATEGORIES,
  PROBLEMATIC_CATEGORIES,
  getCategoryBackgroundColor,
  isProblematicCategory
} from '@/lib/classification-categories';
```

### Use in forms

```typescript
// Instead of hardcoding categories
const categories = [...CLASSIFICATION_CATEGORIES];
```

### Use in display logic

```typescript
// Check if a category needs reasons
if (isProblematicCategory(category)) {
  // Show reasons/explanations
}

// Get color classes
const colorClass = getCategoryBackgroundColor(category);
```

### Use in aggregation

```typescript
// Use centralized order
const classificationOrder = [...CLASSIFICATION_CATEGORIES];

// Check if problematic
if (isProblematicCategory(label)) {
  const reasons = getClassificationReasons(data);
  // ...
}
```

## Files Updated

All files now import from the centralized config:

1. **Forms**: `PublicationReviewForm.tsx` - Uses `CLASSIFICATION_CATEGORIES`
2. **Aggregation**: `label-aggregation.ts` - Uses categories and `isProblematicCategory()`
3. **Display**: `ClaimLabelsStack.tsx` - Uses `PROBLEMATIC_CATEGORIES`
4. **Colors**: `classification-colors.ts` - Re-exports color functions (maintained for backward compatibility)
5. **Claims**: `index.tsx` - Uses `isProblematicCategory()`

## Adding New Categories

To add a new category:

1. Update `ReviewCategory` type in `/src/types/review.ts`
2. Add to `CLASSIFICATION_CATEGORIES` in `/src/lib/classification-categories.ts`
3. Add color mappings to `CATEGORY_BACKGROUND_COLORS` and `CATEGORY_BORDER_COLORS`
4. Add description to `CATEGORY_DESCRIPTIONS`
5. If it's problematic, add to `PROBLEMATIC_CATEGORIES`

That's it! All components will automatically pick up the changes.

## Migration Notes

The refactoring from "Unreliable" → "Inconclusive" and "Fallacy" → "Misinformation" is handled by:
- Database migration: `20251101000002_rename_classification_categories.sql`
- All TypeScript code now uses the new names
- Colors and logic remain consistent

## Backward Compatibility

The old `classification-colors.ts` file still exists and re-exports the functions from the centralized config for backward compatibility. Consider updating imports to use the new centralized module directly.
