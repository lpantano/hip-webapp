-- Fix record_paper_submission_contribution() to use SECURITY DEFINER.
-- Without it, auth.uid() is NULL inside the trigger context, causing the RLS
-- policy on user_contributions (auth.uid() = user_id) to fail and abort the
-- entire trigger chain — including slack_notify_new_publication.
CREATE OR REPLACE FUNCTION public.record_paper_submission_contribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.submitted_by, 'paper_added')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;
