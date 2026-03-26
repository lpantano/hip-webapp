-- Documentation: Slack notification triggers
-- This file documents the DB triggers that call the send-slack-notification edge function.
-- The actual migration is in supabase/migrations/20260326000000_add_slack_notification_triggers.sql
--
-- Prerequisites:
--   - pg_net extension already enabled (20260123225103_remote_schema.sql)
--   - SLACK_WEBHOOK_URL set in Supabase Dashboard → Project Settings → Edge Functions → Environment Variables
--   - Edge function deployed: npx supabase functions deploy send-slack-notification
--
-- How to get SLACK_WEBHOOK_URL:
--   1. Go to https://api.slack.com/apps → Create New App → From Scratch
--   2. Name it (e.g. "Evidence Decoded"), select your workspace → Create App
--   3. In the left sidebar under "Features" → click "Incoming Webhooks" → toggle On
--   4. Click "Add New Webhook to Workspace" → pick a channel → Allow
--   5. Copy the Webhook URL (https://hooks.slack.com/services/T.../B.../...)
--   6. Supabase Dashboard → Project Settings → Edge Functions → Environment Variables
--      Key: SLACK_WEBHOOK_URL  Value: <paste URL>

-- ============================================================
-- 1. New Claim
-- ============================================================
CREATE OR REPLACE FUNCTION notify_slack_new_claim()
RETURNS TRIGGER AS $$
DECLARE
  _url text;
  _key text;
BEGIN
  SELECT
    current_setting('app.supabase_url', true),
    current_setting('app.supabase_service_role_key', true)
  INTO _url, _key;

  IF _url IS NULL OR _key IS NULL THEN
    RAISE WARNING 'Supabase config missing, skipping Slack notification (new_claim)';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := _url || '/functions/v1/send-slack-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || _key
    ),
    body    := jsonb_build_object(
      'event_type', 'new_claim',
      'record',     row_to_json(NEW)
    )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Slack notification failed (new_claim): %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER slack_notify_new_claim
  AFTER INSERT ON claims
  FOR EACH ROW EXECUTE FUNCTION notify_slack_new_claim();

-- ============================================================
-- 2. New Publication
-- ============================================================
CREATE OR REPLACE FUNCTION notify_slack_new_publication()
RETURNS TRIGGER AS $$
DECLARE
  _url         text;
  _key         text;
  _claim_title text;
BEGIN
  SELECT
    current_setting('app.supabase_url', true),
    current_setting('app.supabase_service_role_key', true)
  INTO _url, _key;

  IF _url IS NULL OR _key IS NULL THEN
    RAISE WARNING 'Supabase config missing, skipping Slack notification (new_publication)';
    RETURN NEW;
  END IF;

  SELECT c.title INTO _claim_title
  FROM claims c
  WHERE c.id = NEW.claim_id;

  PERFORM net.http_post(
    url     := _url || '/functions/v1/send-slack-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || _key
    ),
    body    := jsonb_build_object(
      'event_type',  'new_publication',
      'record',      row_to_json(NEW),
      'claim_title', _claim_title
    )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Slack notification failed (new_publication): %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER slack_notify_new_publication
  AFTER INSERT ON publications
  FOR EACH ROW EXECUTE FUNCTION notify_slack_new_publication();

-- ============================================================
-- 3. New Review (publication_scores)
-- ============================================================
CREATE OR REPLACE FUNCTION notify_slack_new_review()
RETURNS TRIGGER AS $$
DECLARE
  _url text;
  _key text;
  _pub record;
BEGIN
  SELECT
    current_setting('app.supabase_url', true),
    current_setting('app.supabase_service_role_key', true)
  INTO _url, _key;

  IF _url IS NULL OR _key IS NULL THEN
    RAISE WARNING 'Supabase config missing, skipping Slack notification (new_review)';
    RETURN NEW;
  END IF;

  SELECT p.title AS pub_title, p.claim_id, c.title AS claim_title
  INTO _pub
  FROM publications p
  JOIN claims c ON c.id = p.claim_id
  WHERE p.id = NEW.publication_id;

  PERFORM net.http_post(
    url     := _url || '/functions/v1/send-slack-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || _key
    ),
    body    := jsonb_build_object(
      'event_type',        'new_review',
      'record',            row_to_json(NEW),
      'publication_title', _pub.pub_title,
      'claim_id',          _pub.claim_id,
      'claim_title',       _pub.claim_title
    )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Slack notification failed (new_review): %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER slack_notify_new_review
  AFTER INSERT ON publication_scores
  FOR EACH ROW EXECUTE FUNCTION notify_slack_new_review();
