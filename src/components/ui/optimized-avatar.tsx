import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarCacheService } from '@/services/AvatarCacheService';
import { cn } from '@/lib/utils';

interface OptimizedAvatarProps {
  userId?: string;
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

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  userId,
  src,
  alt,
  fallback,
  className,
  size = 'md'
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(src || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const optimizeAvatar = async () => {
      if (!src || !userId) {
        setOptimizedSrc(src || null);
        return;
      }
      // console.log('Optimizing avatar for user:', src);
      // Only optimize Google avatars
      if (AvatarCacheService.isGoogleAvatarUrl(src)) {
        setIsLoading(true);
        try {
          const optimized = await AvatarCacheService.getOptimizedAvatarUrl(userId, src);
          setOptimizedSrc(optimized);
        } catch (error) {
          console.error('Error optimizing avatar:', error);
          setOptimizedSrc(src); // Fallback to original
        } finally {
          setIsLoading(false);
        }
      } else {
        setOptimizedSrc(src);
      }
    };

    optimizeAvatar();
  }, [src, userId]);

  // Generate fallback initials from alt text or default
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
      {optimizedSrc && !isLoading && (
        <AvatarImage
          src={optimizedSrc}
          alt={alt}
          onError={() => {
            // If optimized image fails, fall back to original or remove
            if (optimizedSrc !== src && src) {
              setOptimizedSrc(src);
            } else {
              setOptimizedSrc(null);
            }
          }}
        />
      )}
      <AvatarFallback className={cn("bg-primary text-primary-foreground", {
        "opacity-50": isLoading
      })}>
        {isLoading ? '...' : generateFallback()}
      </AvatarFallback>
    </Avatar>
  );
};

export default OptimizedAvatar;
