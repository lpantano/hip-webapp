-- Migration: Add claim subscription notifications
-- Branch: 002-claim-notifications

-- ============================================================
-- ENUM: notification_type
-- ============================================================
CREATE TYPE notification_type AS ENUM (
  'new_paper',
  'new_review',
  'status_changed'
);

-- ============================================================
-- TABLE: claim_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS claim_subscriptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_id)
);

CREATE INDEX idx_claim_subscriptions_claim_id ON claim_subscriptions (claim_id);
CREATE INDEX idx_claim_subscriptions_user_id ON claim_subscriptions (user_id);

ALTER TABLE claim_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscriptions"
  ON claim_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON claim_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON claim_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_read_created
  ON notifications (recipient_user_id, read, created_at DESC);
CREATE INDEX idx_notifications_claim_id ON notifications (claim_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

-- No INSERT policy from client — triggers only

-- ============================================================
-- TRIGGER 1: New paper added → notify subscribers
-- ============================================================
CREATE OR REPLACE FUNCTION notify_subscribers_new_paper()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (recipient_user_id, claim_id, type, message)
  SELECT
    cs.user_id,
    NEW.claim_id,
    'new_paper',
    'A new paper was added to a claim you follow: ' || c.title
  FROM claim_subscriptions cs
  JOIN claims c ON c.id = NEW.claim_id
  WHERE cs.claim_id = NEW.claim_id
    AND cs.user_id IS DISTINCT FROM NEW.submitted_by;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_paper
  AFTER INSERT ON publications
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_new_paper();

-- ============================================================
-- TRIGGER 2: New/updated review → notify subscribers
-- ============================================================
CREATE OR REPLACE FUNCTION notify_subscribers_new_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_claim_id uuid;
BEGIN
  SELECT p.claim_id INTO v_claim_id
  FROM publications p
  WHERE p.id = NEW.publication_id;

  IF v_claim_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (recipient_user_id, claim_id, type, message)
  SELECT
    cs.user_id,
    v_claim_id,
    'new_review',
    'An expert reviewed a paper on a claim you follow: ' || c.title
  FROM claim_subscriptions cs
  JOIN claims c ON c.id = v_claim_id
  WHERE cs.claim_id = v_claim_id
    AND cs.user_id != NEW.expert_user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_review
  AFTER INSERT OR UPDATE ON publication_scores
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_new_review();

-- ============================================================
-- TRIGGER 3: evidence_status change → notify subscribers
-- ============================================================
CREATE OR REPLACE FUNCTION notify_subscribers_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.evidence_status IS NOT DISTINCT FROM NEW.evidence_status THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (recipient_user_id, claim_id, type, message)
  SELECT
    cs.user_id,
    NEW.id,
    'status_changed',
    'The evidence status changed on a claim you follow: ' || NEW.title || ' → ' || COALESCE(NEW.evidence_status::text, 'Unknown')
  FROM claim_subscriptions cs
  WHERE cs.claim_id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_status_change
  AFTER UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_status_change();
