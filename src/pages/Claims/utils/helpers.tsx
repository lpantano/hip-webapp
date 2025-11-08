/**
 * Utility functions for Claims page
 */

import { Link2, Unlink2 } from 'lucide-react';

/**
 * Humanize a string by replacing underscores with spaces and capitalizing words
 */
export const humanize = (s?: string): string => 
  s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

/**
 * Get Tailwind classes for status badges
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'under review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    proposed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get icon component for publication stance
 */
export const getStanceIcon = (stance: 'supporting' | 'contradicting' | 'neutral' | 'mixed' | null | undefined): JSX.Element | null => {
  switch (stance) {
    case 'supporting':
      return <div title="Supporting evidence"><Link2 className="w-4 h-4 text-grey-600" /></div>;
    case 'contradicting':
      return <div title="Contradicting evidence"><Unlink2 className="w-4 h-4 text-grey-600" /></div>;
    case 'neutral':
      return <div className="w-4 h-4 rounded-full bg-gray-400" title="Neutral evidence" />;
    case 'mixed':
      return <div className="w-4 h-4 rounded-full bg-orange-400" title="Mixed evidence" />;
    default:
      return null;
  }
};

/**
 * Normalize and validate URL. Returns normalized URL string or null if invalid.
 */
export const normalizeUrl = (raw: string): string | null => {
  if (!raw) return null;
  let s = raw.trim();
  // If scheme is missing, default to https://
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) {
    s = `https://${s}`;
  }
  try {
    const parsed = new URL(s);
    // Basic check: must have hostname
    if (!parsed.hostname) return null;
    return parsed.toString();
  } catch (e) {
    return null;
  }
};

/**
 * Group array items by a key
 */
export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
};
