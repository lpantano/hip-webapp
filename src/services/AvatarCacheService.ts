import { supabase } from '@/integrations/supabase/client';

export class AvatarCacheService {
  private static readonly CACHE_BUCKET = 'avatars';
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  /**
   * Cache a Google avatar URL in Supabase storage
   */
  static async cacheGoogleAvatar(userId: string, googleAvatarUrl: string): Promise<string | null> {
    try {
      // Check if we already have a cached version
      const cachedUrl = await this.getCachedAvatarUrl(userId);
      if (cachedUrl) {
        return cachedUrl;
      }

      // Download the image from Google
      const response = await fetch(googleAvatarUrl);
      if (!response.ok) {
        console.warn('Failed to fetch Google avatar:', response.status);
        return null;
      }

      const blob = await response.blob();
      const fileName = `google-cache/${userId}/${Date.now()}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.CACHE_BUCKET)
        .upload(fileName, blob, {
          cacheControl: '31536000', // 1 year
          upsert: true,
          contentType: blob.type || 'image/jpeg'
        });

      if (error) {
        console.error('Error caching avatar:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.CACHE_BUCKET)
        .getPublicUrl(data.path);

      // Store the cached URL in user metadata or profiles table
      await this.storeCachedUrl(userId, publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Error in cacheGoogleAvatar:', error);
      return null;
    }
  }

  /**
   * Get cached avatar URL for a user
   */
  static async getCachedAvatarUrl(userId: string): Promise<string | null> {
    try {
      // Check profiles table for cached avatar
      const { data, error } = await supabase
        .from('profiles')
        .select('cached_avatar_url, cached_avatar_updated_at')
        .eq('user_id', userId)
        .single();

      if (error || !data?.cached_avatar_url) {
        return null;
      }

      // Check if cache is still valid (7 days)
      const updatedAt = new Date(data.cached_avatar_updated_at);
      const now = new Date();
      const isExpired = now.getTime() - updatedAt.getTime() > this.CACHE_DURATION;

      if (isExpired) {
        // Clear expired cache
        await this.clearCachedUrl(userId);
        return null;
      }

      return data.cached_avatar_url;
    } catch (error) {
      console.error('Error getting cached avatar:', error);
      return null;
    }
  }

  /**
   * Store cached avatar URL in profiles table
   */
  private static async storeCachedUrl(userId: string, cachedUrl: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          cached_avatar_url: cachedUrl,
          cached_avatar_updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error storing cached URL:', error);
    }
  }

  /**
   * Clear cached avatar URL
   */
  private static async clearCachedUrl(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({
          cached_avatar_url: null,
          cached_avatar_updated_at: null
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error clearing cached URL:', error);
    }
  }

  /**
   * Check if a URL is a Google avatar URL
   */
  static isGoogleAvatarUrl(url: string): boolean {
    return url.includes('googleusercontent.com') || url.includes('lh3.googleusercontent.com');
  }

  /**
   * Get optimized avatar URL - either cached or original if not Google
   */
  static async getOptimizedAvatarUrl(userId: string, originalUrl?: string): Promise<string | null> {
    if (!originalUrl) return null;

    // If it's a Google avatar, try to get cached version
    if (this.isGoogleAvatarUrl(originalUrl)) {
      const cachedUrl = await this.getCachedAvatarUrl(userId);
      if (cachedUrl) {
        return cachedUrl;
      }

      // If no cache, try to create one (async, don't wait)
      this.cacheGoogleAvatar(userId, originalUrl).catch(console.error);
      
      // Return original URL for now (it might work)
      return originalUrl;
    }

    // If not a Google URL, return as-is
    return originalUrl;
  }
}