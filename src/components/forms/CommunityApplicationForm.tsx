import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Form validation schema
const communityApplicationSchema = z.object({
  education: z.string().min(10, "Please provide detailed education (minimum 10 characters)"),
  expertiseArea: z.enum(["nutrition", "fitness", "mental_health", "pregnancy", "menopause", "general_health", "perimenopause"]),
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or greater").max(50, "Please enter a realistic number of years"),
  motivation: z.string().min(50, "Please provide detailed motivation (minimum 50 characters)"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  location: z.string().min(2, "Location must be at least 2 characters").optional().or(z.literal("")),
  socialLinks: z.array(z.object({
    platform: z.string().min(1, "Platform name is required"),
    url: z.string().url("Please enter a valid URL")
  })).optional(),
  memberType: z.enum(["expert", "researcher"]),
});

type CommunityApplicationForm = z.infer<typeof communityApplicationSchema>;

interface CommunityApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberType: "expert" | "researcher";
}

const CommunityApplicationForm = ({ open, onOpenChange, memberType }: CommunityApplicationFormProps) => {
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CommunityApplicationForm>({
    resolver: zodResolver(communityApplicationSchema),
    defaultValues: {
      memberType: memberType,
    }
  });

  const watchedExpertiseArea = watch("expertiseArea");

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    const updated = socialLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setSocialLinks(updated);
    setValue("socialLinks", updated);
  };

  const onSubmit = async (data: CommunityApplicationForm) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your expert application.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert expert application
      const { data: applicationData, error: applicationError } = await supabase
        .from("experts")
        .insert({
          user_id: user.id,
          education: data.education,
          expertise_area: data.expertiseArea,
          years_of_experience: data.yearsOfExperience,
          motivation: data.motivation,
          website: data.website || null,
          location: data.location || null,
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Insert social media links if any
      if (socialLinks.length > 0) {
        const socialLinksData = socialLinks
          .filter(link => link.platform && link.url)
          .map(link => ({
            expert_id: applicationData.id,
            platform: link.platform,
            url: link.url,
          }));

        if (socialLinksData.length > 0) {
          const { error: linksError } = await supabase
            .from("social_media_links")
            .insert(socialLinksData);

          if (linksError) throw linksError;
        }
      }

      toast({
        title: "Application Submitted Successfully!",
        description: "Thank you for your interest. We'll review your application and get back to you soon.",
      });

      // Reset form and close dialog
      reset();
      setSocialLinks([]);
      onOpenChange(false);

    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const expertiseAreaLabels = {
    nutrition: "Nutrition",
    fitness: "Fitness", 
    mental_health: "Mental Health",
    pregnancy: "Pregnancy",
    menopause: "Menopause",
    general_health: "General Health",
    perimenopause: "Perimenopause",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent">{memberType === 'expert' ? 'Expert Application' : 'Researcher Application'}</DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader>
            <p className="text-muted-foreground">
              Join our community of {memberType === 'expert' ? 'healthcare professionals and scientists' : 'researchers and academics'}. All applications are carefully reviewed.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Expertise Area */}
              <div className="space-y-2">
                <Label htmlFor="expertiseArea">Area of Expertise *</Label>
                <Select onValueChange={(value) => setValue("expertiseArea", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary expertise area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="mental_health">Mental Health</SelectItem>
                    <SelectItem value="pregnancy">Pregnancy</SelectItem>
                    <SelectItem value="menopause">Menopause</SelectItem>
                    <SelectItem value="general_health">General Health</SelectItem>
                    <SelectItem value="perimenopause">Perimenopause</SelectItem>
                  </SelectContent>
                </Select>
                {errors.expertiseArea && (
                  <p className="text-sm text-destructive">{errors.expertiseArea.message}</p>
                )}
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  {...register("yearsOfExperience", { valueAsNumber: true })}
                  placeholder="e.g., 5"
                />
                {errors.yearsOfExperience && (
                  <p className="text-sm text-destructive">{errors.yearsOfExperience.message}</p>
                )}
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="education">Education & Professional Background *</Label>
                <Textarea
                  id="education"
                  {...register("education")}
                  placeholder="PhD in Nutrition Science, University of California, San Diego. Board-certified nutritionist with 10+ years of clinical experience..."
                  rows={4}
                />
                {errors.education && (
                  <p className="text-sm text-destructive">{errors.education.message}</p>
                )}
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to join as an expert? *</Label>
                <Textarea
                  id="motivation"
                  {...register("motivation")}
                  placeholder="I'm passionate about improving women's health outcomes through evidence-based research reviews. My experience in clinical nutrition research would contribute to..."
                  rows={4}
                />
                {errors.motivation && (
                  <p className="text-sm text-destructive">{errors.motivation.message}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Professional Website (Optional)</Label>
                <Input
                  id="website"
                  {...register("website")}
                  placeholder="https://www.drjanesmith.com"
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Boston, MA"
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              {/* Social Media Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Social Media Links (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                    className="text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Link
                  </Button>
                </div>
                
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Platform (e.g., LinkedIn, Twitter)"
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                      />
                    </div>
                    <div className="flex-2">
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSocialLink(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityApplicationForm;