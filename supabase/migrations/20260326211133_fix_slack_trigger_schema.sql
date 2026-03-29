-- Fix Slack trigger functions: replace net.http_post with extensions.http_post
-- pg_net is installed in the extensions schema, not net.

CREATE OR REPLACE FUNCTION notify_slack_new_claim()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM extensions.http_post(
    url     := 'https://stbumtfkanunkgopitfd.supabase.co/functions/v1/send-slack-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnVtdGZrYW51bmtnb3BpdGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDg4NjEsImV4cCI6MjA3MDg4NDg2MX0.stvSORCatQ-NWlSwoXSpZU6idKTbfPp_HIAv_1rRL4s'
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

CREATE OR REPLACE FUNCTION notify_slack_new_publication()
RETURNS TRIGGER AS $$
DECLARE
  _claim_title text;
BEGIN
  SELECT c.title INTO _claim_title
  FROM claims c
  WHERE c.id = NEW.claim_id;

  PERFORM extensions.http_post(
    url     := 'https://stbumtfkanunkgopitfd.supabase.co/functions/v1/send-slack-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnVtdGZrYW51bmtnb3BpdGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDg4NjEsImV4cCI6MjA3MDg4NDg2MX0.stvSORCatQ-NWlSwoXSpZU6idKTbfPp_HIAv_1rRL4s'
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

CREATE OR REPLACE FUNCTION notify_slack_new_review()
RETURNS TRIGGER AS $$
DECLARE
  _pub record;
BEGIN
  SELECT p.title AS pub_title, p.claim_id, c.title AS claim_title
  INTO _pub
  FROM publications p
  JOIN claims c ON c.id = p.claim_id
  WHERE p.id = NEW.publication_id;

  PERFORM extensions.http_post(
    url     := 'https://stbumtfkanunkgopitfd.supabase.co/functions/v1/send-slack-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnVtdGZrYW51bmtnb3BpdGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDg4NjEsImV4cCI6MjA3MDg4NDg2MX0.stvSORCatQ-NWlSwoXSpZU6idKTbfPp_HIAv_1rRL4s'
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
