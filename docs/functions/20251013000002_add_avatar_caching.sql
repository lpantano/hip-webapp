-- Add avatar caching fields to profiles table
ALTER TABLE profiles 
ADD COLUMN cached_avatar_url TEXT,
ADD COLUMN cached_avatar_updated_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_cached_avatar_updated_at 
ON profiles (cached_avatar_updated_at) 
WHERE cached_avatar_url IS NOT NULL;