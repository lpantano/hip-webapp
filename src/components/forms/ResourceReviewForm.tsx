import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  supports: z.enum(["true", "false"]),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ResourceReviewFormProps {
  resourceId: string;
  resourceName: string;
  onReviewSubmitted?: () => void;
}

export const ResourceReviewForm = ({ resourceId, resourceName, onReviewSubmitted }: ResourceReviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supports: "true",
      comments: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to review resources."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("resource_reviews")
        .upsert({
          resource_id: resourceId,
          reviewer_user_id: user.id,
          supports: values.supports === "true",
          comments: values.comments || null,
        });

      if (error) throw error;

      toast.success("Review submitted successfully", {
        description: "Your review has been recorded."
      });

      form.reset();
      onReviewSubmitted?.();
    } catch (error: unknown) {
      toast.error("Error submitting review", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review Resource: {resourceName}</CardTitle>
        <CardDescription>
          Please evaluate whether this resource should be added to our trusted resources list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="supports"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you support adding this resource?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="true" />
                        <FormLabel className="font-normal">
                          Yes, I support adding this resource
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="false" />
                        <FormLabel className="font-normal">
                          No, I do not support adding this resource
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your reasoning for supporting or not supporting this resource"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide context for your decision to help other reviewers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting Review..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};