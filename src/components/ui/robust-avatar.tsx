import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { optimizeGoogleAvatarUrl } from '@/lib/avatar-utils';
import { cn } from '@/lib/utils';

interface RobustAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64
};

export const RobustAvatar: React.FC<RobustAvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  size = 'md'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      setHasError(false);
      setRetryCount(0);
      return;
    }

    // Optimize Google URLs
    const optimizedSrc = optimizeGoogleAvatarUrl(src, sizePixels[size]);
    setImageSrc(optimizedSrc);
    setHasError(false);
  }, [src, size]);

  const handleError = () => {
    if (retryCount < 2) {
      // Retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageSrc(prev => prev ? `${prev}&retry=${Date.now()}` : null);
      }, delay);
    } else {
      setHasError(true);
      setImageSrc(null);
    }
  };

  const generateFallback = () => {
    if (fallback) return fallback;
    
    if (alt) {
      const initials = alt
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return initials || 'U';
    }
    
    return 'U';
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageSrc && !hasError && (
        <AvatarImage 
          src={imageSrc} 
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {generateFallback()}
      </AvatarFallback>
    </Avatar>
  );
};