import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Form validation schema
const communityApplicationSchema = z.object({
  role: z.enum(["expert", "researcher"]),
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
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      role: memberType,
      memberType: memberType,
    }
  });

  const watchedExpertiseArea = watch("expertiseArea");
  const watchedRole = watch("role");

  // Debug: Log errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

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
    setValue("socialLinks", updated, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = async (data: CommunityApplicationForm) => {
    if (!user) {
      toast.error("Authentication Required", {
        description: "Please sign in to submit your expert application."
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
          member_type: data.role,
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

      toast.success("Application Submitted Successfully!", {
        description: "Thank you for your interest. We'll review your application and get back to you soon."
      });

      // Reset form and close dialog
      reset();
      setSocialLinks([]);
      onOpenChange(false);

    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Submission Failed", {
        description: "There was an error submitting your application. Please try again."
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
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log("Form validation failed:", errors);
              // Errors should already be in the errors object from formState
            })} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-4">
                <Label htmlFor="role">I am applying as a: *</Label>
                <Select
                  defaultValue={memberType}
                  onValueChange={(value) => setValue("role", value as "expert" | "researcher", { shouldDirty: true, shouldTouch: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive font-medium">{errors.role.message}</p>
                )}
                
                {/* Role Explanations */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-semibold text-primary mb-2">Expert</h4>
                    <p className="text-sm text-muted-foreground">
                      Healthcare professionals and practitioners who provide services directly to clients. 
                      Examples: fitness coaches, gynecologists for endometriosis, nutritionists, mental health therapists. 
                      You will include content about the services you already provide.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-semibold text-accent mb-2">Researcher</h4>
                    <p className="text-sm text-muted-foreground">
                      Scientists and academics who evaluate research and add expert information to the platform. 
                      You know how to evaluate papers and understand what experts are saying, but may not provide direct services yourself.
                    </p>
                  </div>
                </div>
              </div>
              {/* Expertise Area */}
              <div className="space-y-2">
                <Label htmlFor="expertiseArea">Area of Expertise *</Label>
                <Select onValueChange={(value) => setValue("expertiseArea", value as "nutrition" | "fitness" | "mental_health" | "pregnancy" | "menopause" | "general_health" | "perimenopause", { shouldDirty: true, shouldTouch: true })}>
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
                  <p className="text-sm text-destructive font-medium">{errors.expertiseArea.message}</p>
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
                  className={errors.yearsOfExperience ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.yearsOfExperience && (
                  <p className="text-sm text-destructive font-medium">{errors.yearsOfExperience.message}</p>
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
                  className={errors.education ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.education && (
                  <p className="text-sm text-destructive font-medium">{errors.education.message}</p>
                )}
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to join our community? *</Label>
                <Textarea
                  id="motivation"
                  {...register("motivation")}
                  placeholder="I'm passionate about improving women's health outcomes through evidence-based research reviews. My experience would contribute to..."
                  rows={4}
                  className={errors.motivation ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.motivation && (
                  <p className="text-sm text-destructive font-medium">{errors.motivation.message}</p>
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

              {/* Form Errors Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm font-semibold text-destructive mb-2">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                    {errors.role && <li>Role selection is required</li>}
                    {errors.expertiseArea && <li>Expertise area is required</li>}
                    {errors.yearsOfExperience && <li>{errors.yearsOfExperience.message}</li>}
                    {errors.education && <li>{errors.education.message}</li>}
                    {errors.motivation && <li>{errors.motivation.message}</li>}
                    {errors.website && <li>{errors.website.message}</li>}
                    {errors.location && <li>{errors.location.message}</li>}
                  </ul>
                </div>
              )}

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