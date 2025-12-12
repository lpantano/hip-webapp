import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Shield, FileText, Calendar, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import type { Database } from '@/integrations/supabase/types';

const Profile = () => {
  const { user, session, updatePassword, hasPasswordAuth } = useAuth();
  const queryClient = useQueryClient();

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  // Expert form state
  const [education, setEducation] = useState('');
  const [motivation, setMotivation] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [expertiseText, setExpertiseText] = useState('');
  // Social media links for expert profile
  const [socialLinks, setSocialLinks] = useState<{ id?: string; platform: string; url: string }[]>([]);

  // Password change form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Determine the user's role among 'expert' or 'researcher' (null if neither).
  const { data: userRole = null } = useQuery({
    queryKey: ['user-expert-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Check for both 'expert' and 'researcher' roles in parallel.
      const [{ data: isExpertRole }, { data: isResearcherRole }] = await Promise.all([
        supabase.rpc('has_role', { _user_id: user.id, _role: 'expert' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'researcher' })
      ]);

      if (isExpertRole) return 'expert';
      if (isResearcherRole) return 'researcher';
      return null;
    },
    enabled: !!user
  });

  // Convenience boolean for showing expert-related UI if they have either role
  const isExpertOrResearcher = !!userRole;

  // Fetch expert data if user is expert
  const { data: expertData } = useQuery({
    queryKey: ['expert-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && isExpertOrResearcher
  });

  // Set form values when data loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (expertData) {
      setEducation(expertData.education || '');
      setMotivation(expertData.motivation || '');
      setLocation(expertData.location || '');
      setWebsite(expertData.website || '');
      setYearsOfExperience(expertData.years_of_experience?.toString() || '');
      setExpertiseText(expertData.expertise_text || '');
    }
  }, [expertData]);

  // Fetch existing social links for this expert (use experts.id, which references social_media_links.expert_id)
  const { data: socialLinksData } = useQuery({
    queryKey: ['expert-social-links', expertData?.id],
    queryFn: async () => {
      if (!expertData?.id) return [];
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('expert_id', expertData.user_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!expertData?.user_id
  });

  useEffect(() => {
    if (socialLinksData) {
      setSocialLinks((socialLinksData as Database['public']['Tables']['social_media_links']['Row'][]).map(s => ({ id: s.id, platform: s.platform, url: s.url })));
    }
  }, [socialLinksData]);

  // Decode JWT to get session start time
  useEffect(() => {
    if (session?.access_token) {
      try {
        // Decode the JWT to get the 'issued at' (iat) claim
        const jwtPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const issuedAtTimestamp = jwtPayload.iat; // This is in Unix epoch seconds

        // Convert to a readable Date object
        const startTime = new Date(issuedAtTimestamp * 1000); // Multiply by 1000 for milliseconds
        setSessionStartTime(startTime.toLocaleString());
      } catch (error) {
        console.error('Error decoding session token:', error);
        setSessionStartTime(null);
      }
    } else {
      setSessionStartTime(null);
    }
  }, [session]);

  const addSocialLink = () => setSocialLinks(prev => [...prev, { platform: '', url: '' }]);
  const removeSocialLink = (index: number) => setSocialLinks(prev => prev.filter((_, i) => i !== index));
  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks(prev => prev.map((link, i) => i === index ? { ...link, [field]: value } : link));
  };

  // Helper: map platform to canonical URL prefix so users only type their username
  const platformPrefixes: Record<string, string> = {
    twitter: 'https://twitter.com/',
    linkedin: 'https://www.linkedin.com/in/',
    instagram: 'https://www.instagram.com/',
    tiktok: 'https://www.tiktok.com/@',
    youtube: 'https://www.youtube.com/@',
    facebook: 'https://www.facebook.com/',
    reddit: 'https://www.reddit.com/user/',
    podcast: 'https://podcasts.apple.com/',
    other: 'https://'
  };

  const getPlatformPrefix = (platform?: string) => {
    if (!platform || platform === 'none') return 'https://';
    return platformPrefixes[platform.toLowerCase()] || 'https://';
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl
        }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated", {
        description: "Your profile information has been updated successfully."
      });
      // Invalidate both profile queries and user-profile queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: unknown) => {
      console.error('Profile update error', error);
      toast.error("Error", {
        description: "Failed to update profile. Please try again."
      });
    }
  });

  // Update expert mutation
  const updateExpertMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const res = await supabase
        .from('experts')
        .upsert({
          user_id: user.id,
          education: education,
          motivation: motivation,
          location: location,
          website: website,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          expertise_text: expertiseText
        }, { onConflict: 'user_id' })
        .select()
        .maybeSingle();

      const { data: expertRow, error: upsertError } = res as { data: Database['public']['Tables']['experts']['Row'] | null; error: unknown };

      if (upsertError) throw upsertError;

      // social_media_links.expert_id references experts.user_id, so use the expert record id
      const expertId = expertRow?.user_id || expertData?.user_id;

      // Replace social links: delete existing then insert new ones if provided
      if (expertId) {
        const { error: delError } = await supabase
          .from('social_media_links')
          .delete()
          .eq('expert_id', expertId);
        if (delError) throw delError;

        const linksToInsert = socialLinks
          .filter(l => l.platform?.trim() && l.platform !== 'none' && l.url?.trim())
          .map(l => {
            const username = l.url.trim();
            const prefix = getPlatformPrefix(l.platform);
            const fullUrl = username.startsWith('http') ? username : `${prefix}${username}`;
            return { expert_id: expertId, platform: l.platform.trim(), url: fullUrl };
          });

        if (linksToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('social_media_links')
            .insert(linksToInsert);
          if (insertError) throw insertError;
        }
      }
     },
     onSuccess: () => {
       toast.success("Expert profile updated", {
         description: "Your expert information has been updated successfully."
       });
       queryClient.invalidateQueries({ queryKey: ['expert-data'] });
       queryClient.invalidateQueries({ queryKey: ['expert-social-links'] });
     },
     onError: (error: unknown) => {
       console.error('Expert update error', error);
       toast.error("Error", {
         description: "Failed to update expert profile. Please try again."
       });
     }
   });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Header />
        <div className="pt-28 px-6 flex items-center justify-center h-screen">
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Header />
      <main className="pt-28 px-4 sm:px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your personal information and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* Basic Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl}
                    onAvatarChange={setAvatarUrl}
                    userId={user.id}
                    displayName={displayName}
                    size="lg"
                  />
                  <div className="flex-1 w-full">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your basic profile details and avatar</CardDescription>
                    {isExpertOrResearcher && (
                      <Badge variant="secondary" className="flex items-center gap-1 mt-2 w-fit">
                        <Shield className="w-3 h-3" />
                        {userRole === 'researcher' ? 'Researcher' : 'Expert'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Or use the upload button above
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => updateProfileMutation.mutate()}
                  disabled={updateProfileMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Expert Profile Card */}
                    {isExpertOrResearcher && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Expert Information
                  </CardTitle>
                  <CardDescription>Manage your expert credentials and specializations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expertiseText">Expertise Area</Label>
                      <Input
                        id="expertiseText"
                        value={expertiseText}
                        onChange={(e) => setExpertiseText(e.target.value)}
                        placeholder="e.g., Menopause hormonal therapy"
                        maxLength={40}
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>10-40 characters</span>
                        <span>{expertiseText?.length || 0}/40</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="education">Education & Credentials</Label>
                    <Textarea
                      id="education"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="Your educational background, degrees, certifications..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="motivation">Professional Motivation</Label>
                    <Textarea
                      id="motivation"
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Why are you passionate about evidence-based healthcare?"
                      rows={3}
                    />
                  </div>

                {/* Social Media Links */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <Label>Social Media Links (Optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="text-sm w-full sm:w-auto">
                      Add Link
                    </Button>
                  </div>

                  {/* Show current social media links if any exist */}
                  {socialLinks.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-xs text-muted-foreground mb-1">Current Links:</Label>
                      <ul className="space-y-1">
                        {socialLinks.map((link, idx) => (
                          link.platform && link.platform !== 'none' && link.url ? (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <span className="font-medium capitalize">{link.platform}</span>
                              <a href={link.url.startsWith('http') ? link.url : getPlatformPrefix(link.platform) + link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                {link.url.startsWith('http') ? link.url : getPlatformPrefix(link.platform) + link.url}
                              </a>
                            </li>
                          ) : null
                        ))}
                      </ul>
                      <Separator className="my-2" />
                    </div>
                  )}

                  <div className="space-y-3">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <div className="w-full sm:w-[160px] sm:flex-shrink-0">
                          <Select value={link.platform} onValueChange={(v) => updateSocialLink(index, 'platform', v)}>
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="reddit">Reddit</SelectItem>
                              <SelectItem value="podcast">Podcast</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-0 w-full">
                            <span className="inline-flex items-center px-2 h-9 rounded-l-md bg-muted/20 text-xs text-muted-foreground select-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">
                              {getPlatformPrefix(link.platform)}
                            </span>
                            <Input
                              className="rounded-l-none flex-1 h-9 min-w-0"
                              placeholder="username or handle"
                              value={link.url}
                              onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            />
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => removeSocialLink(index)} className="shrink-0 w-full sm:w-auto">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                  <Button
                    onClick={() => updateExpertMutation.mutate()}
                    disabled={updateExpertMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateExpertMutation.isPending ? 'Updating...' : 'Update Expert Profile'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Email</Label>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div>
                    <Label>Account Created</Label>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {sessionStartTime && (
                  <div>
                    <Label>Session Started At</Label>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {sessionStartTime}
                    </div>
                  </div>
                )}

                {/* Password Change Section - Only show if user has password auth */}
                {hasPasswordAuth() && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Change Password
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Update your account password
                          </CardDescription>
                        </div>
                        {!showPasswordForm && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPasswordForm(true)}
                            className="w-full sm:w-auto"
                          >
                            Change Password
                          </Button>
                        )}
                      </div>

                      {showPasswordForm && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();

                            // Validate passwords match
                            if (newPassword !== confirmPassword) {
                              toast.error('Passwords do not match', {
                                description: 'Please make sure both password fields match.',
                              });
                              return;
                            }

                            // Validate password length
                            if (newPassword.length < 6) {
                              toast.error('Password too short', {
                                description: 'Password must be at least 6 characters long.',
                              });
                              return;
                            }

                            setIsChangingPassword(true);
                            try {
                              const { error } = await updatePassword(newPassword);
                              if (!error) {
                                // Reset form on success
                                setNewPassword('');
                                setConfirmPassword('');
                                setShowPasswordForm(false);
                              }
                            } finally {
                              setIsChangingPassword(false);
                            }
                          }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter your new password"
                              autoComplete="new-password"
                              required
                              minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                              Password must be at least 6 characters long
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm your new password"
                              autoComplete="new-password"
                              required
                              minLength={6}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              type="submit"
                              disabled={isChangingPassword || !newPassword || !confirmPassword}
                              className="w-full sm:w-auto"
                            >
                              {isChangingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setNewPassword('');
                                setConfirmPassword('');
                              }}
                              disabled={isChangingPassword}
                              className="w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
