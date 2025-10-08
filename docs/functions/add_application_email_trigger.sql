-- Enable the http extension if not already enabled
-- This extension allows making HTTP requests from database functions
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create function to send application notification via Edge Function
CREATE OR REPLACE FUNCTION send_application_notification()
RETURNS TRIGGER AS $$
DECLARE
    function_url text;
    service_key text;
BEGIN
    -- Get the Supabase URL and service key from settings
    -- These should be set in your Supabase project configuration
    SELECT 
        current_setting('app.supabase_url', true),
        current_setting('app.supabase_service_role_key', true)
    INTO function_url, service_key;
    
    -- Skip if configuration is not available
    IF function_url IS NULL OR service_key IS NULL THEN
        RAISE WARNING 'Supabase configuration not found, skipping email notification';
        RETURN NEW;
    END IF;
    
    -- Construct the full function URL
    function_url := function_url || '/functions/v1/send-application-emails';
    
    -- Call the edge function asynchronously
    -- This will not block the application submission if email fails
    PERFORM
        net.http_post(
            url := function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_key
            ),
            body := jsonb_build_object('record', row_to_json(NEW))::text
        );
    
    -- Always return NEW to continue with the insert
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- Log the error but don't fail the application submission
        RAISE WARNING 'Failed to send application notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after expert application insert
-- This will automatically send emails when a new application is submitted
CREATE TRIGGER after_expert_application_insert
    AFTER INSERT ON experts
    FOR EACH ROW
    EXECUTE FUNCTION send_application_notification();

-- Add comment for documentation
COMMENT ON FUNCTION send_application_notification() IS 
'Automatically sends confirmation and admin notification emails when a new expert application is submitted';

COMMENT ON TRIGGER after_expert_application_insert ON experts IS 
'Triggers email notifications after successful expert application submission';