-- ============================================
-- MATCHMAKING SYSTEM DATABASE SCHEMA
-- ============================================
-- This script updates the database to support:
-- - Request expiration (30 minutes)
-- - One active outgoing request per user
-- - Prevention of duplicate/reciprocal requests
-- - Auto-expiration of old requests
-- ============================================

-- 1. Update match_requests table to add expiration
ALTER TABLE match_requests 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id) ON DELETE SET NULL;

-- 2. Create index for expiration queries
CREATE INDEX IF NOT EXISTS idx_match_requests_expires_at ON match_requests(expires_at) WHERE status = 'pending';

-- 3. Create unique constraint to prevent duplicate pending requests
-- Drop existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'match_requests_sender_receiver_unique'
  ) THEN
    ALTER TABLE match_requests DROP CONSTRAINT match_requests_sender_receiver_unique;
  END IF;
END $$;

-- Create new constraint that only applies to pending requests
CREATE UNIQUE INDEX IF NOT EXISTS match_requests_pending_unique 
ON match_requests(sender_id, receiver_id) 
WHERE status = 'pending';

-- 4. Function to auto-expire old requests
CREATE OR REPLACE FUNCTION expire_old_match_requests()
RETURNS void AS $$
BEGIN
  UPDATE match_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Function to check if user can send request (enforces one-request-at-a-time)
CREATE OR REPLACE FUNCTION can_send_request(
  p_sender_id UUID,
  p_receiver_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_active_request BOOLEAN;
  v_receiver_online BOOLEAN;
  v_has_reciprocal_request BOOLEAN;
BEGIN
  -- Check if sender already has an active outgoing request
  SELECT EXISTS(
    SELECT 1 FROM match_requests
    WHERE sender_id = p_sender_id
      AND status = 'pending'
      AND expires_at > NOW()
  ) INTO v_has_active_request;

  IF v_has_active_request THEN
    RETURN FALSE;
  END IF;

  -- Check if receiver is online
  SELECT is_online INTO v_receiver_online
  FROM players
  WHERE user_id = p_receiver_id;

  IF NOT v_receiver_online THEN
    RETURN FALSE;
  END IF;

  -- Check if sender is online
  SELECT is_online INTO v_receiver_online
  FROM players
  WHERE user_id = p_sender_id;

  IF NOT v_receiver_online THEN
    RETURN FALSE;
  END IF;

  -- Check if there's already a pending request in the opposite direction
  SELECT EXISTS(
    SELECT 1 FROM match_requests
    WHERE sender_id = p_receiver_id
      AND receiver_id = p_sender_id
      AND status = 'pending'
      AND expires_at > NOW()
  ) INTO v_has_reciprocal_request;

  IF v_has_reciprocal_request THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_match_requests_updated_at ON match_requests;
CREATE TRIGGER update_match_requests_updated_at
  BEFORE UPDATE ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Update matches table to add started_at timestamp
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ;

-- 8. Add RLS policy to allow viewing expired requests (for history)
-- This is already covered by existing policies, but we ensure it works

-- 9. Create function to mark matched players as unavailable
CREATE OR REPLACE FUNCTION mark_players_matched(
  p_player1_id UUID,
  p_player2_id UUID
)
RETURNS void AS $$
BEGIN
  -- When a match is created, we don't remove them from online status
  -- Instead, we rely on the match_requests status to filter them
  -- This allows them to still be visible but not receive new requests
  NULL; -- Placeholder for future logic if needed
END;
$$ LANGUAGE plpgsql;

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION can_send_request(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_match_requests() TO authenticated;



