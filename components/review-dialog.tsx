'use client';

import { useState, type FormEvent } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { describeDataError } from '@/lib/errors';
import { createReview } from '@/lib/queries';
import { reviewSchema } from '@/lib/validation';

export function ReviewDialog({
  requestId,
  partnerId,
  partnerName,
  onClose,
  onSaved,
}: {
  requestId: string;
  partnerId: string;
  partnerName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check the form.');
      return;
    }
    setSubmitting(true);
    try {
      await createReview({ request_id: requestId, reviewee_id: partnerId, ...parsed.data });
      onSaved();
      onClose();
    } catch (err) {
      setError(describeDataError(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your swap with {partnerName}</DialogTitle>
          <DialogDescription>Your review appears on their public profile.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <StarRating value={rating} onChange={setRating} size="lg" />
            <p className="text-sm text-stone-500">{rating ? `${rating} out of 5` : 'Tap a star to rate'}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="review-comment" className="text-sm font-medium text-stone-800">
                Comment (optional)
              </label>
              <span className="text-xs text-stone-500">{comment.length}/500</span>
            </div>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="How was the exchange?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || rating === 0} className="bg-emerald-700 text-white hover:bg-emerald-800">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
