/*
# Create chat messages for accepted swaps

1. New Tables
- `messages`: chat messages inside a swap conversation.
  - `request_id` (the swap the chat belongs to)
  - `sender_id` (defaults to the signed-in member)
  - `body` (1-2000 characters)
  - `created_at`

2. Real-time
- The messages table is added to the real-time publication so new messages appear instantly for both people.

3. Security
- Row level security enabled.
- Only the two participants of a swap can read or send messages, and only once the swap is accepted or completed.
- Senders must be the signed-in member; messages cannot be edited or deleted.

4. Indexes
- Index on (request_id, created_at) for fast chronological history loading.
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_request_created_idx ON messages (request_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON messages TO authenticated;

DROP POLICY IF EXISTS "participants_read_messages" ON messages;
CREATE POLICY "participants_read_messages" ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM swap_requests s
    WHERE s.id = messages.request_id
      AND (s.requester_id = auth.uid() OR s.recipient_id = auth.uid())
      AND s.status IN ('accepted', 'completed')
  )
);

DROP POLICY IF EXISTS "participants_send_messages" ON messages;
CREATE POLICY "participants_send_messages" ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM swap_requests s
    WHERE s.id = messages.request_id
      AND (s.requester_id = auth.uid() OR s.recipient_id = auth.uid())
      AND s.status IN ('accepted', 'completed')
  )
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
