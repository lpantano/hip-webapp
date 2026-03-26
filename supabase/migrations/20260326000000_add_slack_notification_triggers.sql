-- Migration: Add Slack webhook notifications for claims, publications, and reviews
-- Adds three AFTER INSERT triggers that call the send-slack-notification edge function
-- via net.http_post(). All trigger functions use EXCEPTION WHEN OTHERS so Slack
-- failures never block the primary database operation.
-- pg_net extension is already enabled (20260123225103_remote_schema.sql).

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

COMMENT ON FUNCTION notify_slack_new_claim() IS
  'Sends a Slack notification when a new claim is submitted';
COMMENT ON TRIGGER slack_notify_new_claim ON claims IS
  'Triggers Slack notification after a new claim is inserted';

-- ============================================================
-- 2. New Publication
-- ============================================================
CREATE OR REPLACE FUNCTION notify_slack_new_publication()
RETURNS TRIGGER AS $$
DECLARE
  _url        text;
  _key        text;
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

  -- Enrich payload with parent claim title
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

COMMENT ON FUNCTION notify_slack_new_publication() IS
  'Sends a Slack notification when a new publication is added to a claim';
COMMENT ON TRIGGER slack_notify_new_publication ON publications IS
  'Triggers Slack notification after a new publication is inserted';

-- ============================================================
-- 3. New Review (publication_scores)
-- ============================================================
CREATE OR REPLACE FUNCTION notify_slack_new_review()
RETURNS TRIGGER AS $$
DECLARE
  _url             text;
  _key             text;
  _pub             record;
BEGIN
  SELECT
    current_setting('app.supabase_url', true),
    current_setting('app.supabase_service_role_key', true)
  INTO _url, _key;

  IF _url IS NULL OR _key IS NULL THEN
    RAISE WARNING 'Supabase config missing, skipping Slack notification (new_review)';
    RETURN NEW;
  END IF;

  -- Enrich payload with publication title and parent claim id + title
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

COMMENT ON FUNCTION notify_slack_new_review() IS
  'Sends a Slack notification when an expert submits a new review';
COMMENT ON TRIGGER slack_notify_new_review ON publication_scores IS
  'Triggers Slack notification after a new expert review is inserted';
