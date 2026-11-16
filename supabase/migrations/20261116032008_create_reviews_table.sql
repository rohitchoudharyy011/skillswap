/*
# Create reviews for completed swaps

1. New Tables
- `reviews`: a 1-5 star rating and optional comment one participant leaves for the other after a swap is completed.
  - `request_id` (the completed swap)
  - `reviewer_id` (defaults to the signed-in member)
  - `reviewee_id` (the other participant)
  - `rating` (whole number 1-5)
  - `comment` (up to 500 characters)
  - `created_at`

2. Business rules enforced by the database
- Reviews can only be written for swaps with status completed.
- The reviewer and reviewee must be the two participants of that swap.
- Each member can leave one review per swap.

3. Security
- Row level security enabled.
- Ratings are visible to signed-in members (they appear on public profiles).
- Reviews cannot be edited or deleted by members.

4. Indexes
- Index on reviewee_id to compute profile averages quickly.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '' CHECK (char_length(comment) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (reviewer_id <> reviewee_id),
  UNIQUE (request_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS reviews_reviewee_idx ON reviews (reviewee_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON reviews TO authenticated;

DROP POLICY IF EXISTS "members_read_reviews" ON reviews;
CREATE POLICY "members_read_reviews" ON reviews FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "reviewers_rate_completed_swaps" ON reviews;
CREATE POLICY "reviewers_rate_completed_swaps" ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  reviewer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM swap_requests s
    WHERE s.id = reviews.request_id
      AND s.status = 'completed'
      AND (
        (s.requester_id = auth.uid() AND s.recipient_id = reviews.reviewee_id)
        OR (s.recipient_id = auth.uid() AND s.requester_id = reviews.reviewee_id)
      )
  )
);
