/*
# Create swap requests with accept, reject and complete workflow

1. New Tables
- `swap_requests`: a proposal from one member (requester) to another (recipient) to trade skills.
  - `requester_id`, `recipient_id` (both members, cannot be the same person)
  - `offered_skill`: the skill the requester teaches
  - `wanted_skill`: the skill the requester wants to learn from the recipient
  - `message`: optional note (up to 500 characters)
  - `status`: pending, accepted, rejected, or completed
  - `created_at`, `updated_at`

2. Business rules enforced by the database
- A request can only be created by the requester, starting as pending.
- The offered skill must be one the requester offers, and must be one the recipient wants (reciprocal match).
- The wanted skill must be one the recipient offers.
- A member cannot have two open (pending or accepted) requests to the same person.

3. Status changes
- Only the recipient can accept or reject a pending request, through the respond_to_swap function.
- Either participant can mark an accepted swap as completed, through the complete_swap function.
- Members cannot change statuses by editing rows directly (no update grant).

4. Security
- Row level security enabled. Members can only see requests they sent or received.
- Functions are restricted to signed-in members only.
*/

CREATE TABLE IF NOT EXISTS swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offered_skill text NOT NULL CHECK (char_length(offered_skill) BETWEEN 1 AND 40),
  wanted_skill text NOT NULL CHECK (char_length(wanted_skill) BETWEEN 1 AND 40),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> recipient_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS swap_requests_open_pair_idx
  ON swap_requests (requester_id, recipient_id) WHERE status IN ('pending', 'accepted');
CREATE INDEX IF NOT EXISTS swap_requests_recipient_idx ON swap_requests (recipient_id, status);
CREATE INDEX IF NOT EXISTS swap_requests_requester_idx ON swap_requests (requester_id, status);

ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON swap_requests TO authenticated;

DROP POLICY IF EXISTS "participants_read_swaps" ON swap_requests;
CREATE POLICY "participants_read_swaps" ON swap_requests FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "create_own_swap_request" ON swap_requests;
CREATE POLICY "create_own_swap_request" ON swap_requests FOR INSERT
TO authenticated
WITH CHECK (
  requester_id = auth.uid()
  AND status = 'pending'
  AND EXISTS (
    SELECT 1 FROM profiles req
    WHERE req.id = swap_requests.requester_id
      AND swap_requests.offered_skill = ANY (req.skills_offered)
  )
  AND EXISTS (
    SELECT 1 FROM profiles rec
    WHERE rec.id = swap_requests.recipient_id
      AND swap_requests.wanted_skill = ANY (rec.skills_offered)
      AND swap_requests.offered_skill = ANY (rec.skills_wanted)
  )
);

DROP TRIGGER IF EXISTS swap_requests_touch_updated_at ON swap_requests;
CREATE TRIGGER swap_requests_touch_updated_at BEFORE UPDATE ON swap_requests
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION respond_to_swap(p_request_id uuid, p_accept boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_accept IS NULL THEN
    RAISE EXCEPTION 'A decision is required' USING ERRCODE = '22023';
  END IF;

  UPDATE swap_requests
  SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'rejected' END
  WHERE id = p_request_id
    AND recipient_id = auth.uid()
    AND status = 'pending';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RAISE EXCEPTION 'This request can no longer be answered' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION complete_swap(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE swap_requests
  SET status = 'completed'
  WHERE id = p_request_id
    AND status = 'accepted'
    AND (requester_id = auth.uid() OR recipient_id = auth.uid());

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RAISE EXCEPTION 'Only accepted swaps can be completed by a participant' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION respond_to_swap(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION respond_to_swap(uuid, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION complete_swap(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION complete_swap(uuid) TO authenticated;
