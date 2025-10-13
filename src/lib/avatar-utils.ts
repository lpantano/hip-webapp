/**
 * Utility to optimize Google avatar URLs
 */
export const optimizeGoogleAvatarUrl = (url: string, size: number = 64): string => {
  if (!url || !url.includes('googleusercontent.com')) {
    return url;
  }

  // Replace size parameter to reduce bandwidth and requests
  return url.replace(/=s\d+-c$/, `=s${size}-c`);
};

/**
 * Add loading="lazy" and other optimizations to images
 */
export const getAvatarProps = (src?: string | null, size: number = 64) => {
  const optimizedSrc = src ? optimizeGoogleAvatarUrl(src, size) : null;
  
  return {
    src: optimizedSrc,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    referrerPolicy: 'no-referrer' as const, // Helps with some CORS issues
  };
};