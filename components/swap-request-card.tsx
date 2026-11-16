'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Loader2, MessageCircle, Star } from 'lucide-react';
import { ReviewDialog } from '@/components/review-dialog';
import { StatusBadge } from '@/components/status-badge';
import { SkillChip } from '@/components/skill-chip';
import { Button } from '@/components/ui/button';
import { describeDataError } from '@/lib/errors';
import { completeSwap, respondToSwap } from '@/lib/queries';
import { partnerIdOf } from '@/lib/swaps';
import type { SwapRequest } from '@/lib/types';

export function SwapRequestCard({
  request,
  meId,
  reviewed,
  onChanged,
}: {
  request: SwapRequest;
  meId: string;
  reviewed: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const iAmRecipient = request.recipient_id === meId;
  const partner = iAmRecipient ? request.requester : request.recipient;
  const partnerName = partner?.name ?? 'Member';
  const iTeach = iAmRecipient ? request.wanted_skill : request.offered_skill;
  const iLearn = iAmRecipient ? request.offered_skill : request.wanted_skill;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(describeDataError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {iAmRecipient ? 'Incoming request' : 'Sent request'}
          </p>
          <Link href={`/members/${partnerIdOf(request, meId)}`} className="mt-1 block text-lg font-semibold text-stone-900 hover:text-emerald-800">
            {partnerName}
          </Link>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone-500">You teach</p>
          <SkillChip skill={iTeach} highlighted />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone-500">You learn</p>
          <SkillChip skill={iLearn} />
        </div>
      </div>

      {request.message && (
        <blockquote className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
          {request.message}
        </blockquote>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-5">
        {request.status === 'pending' && iAmRecipient && (
          <>
            <Button
              disabled={busy}
              onClick={() => run(() => respondToSwap(request.id, true))}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Accept
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => run(() => respondToSwap(request.id, false))}>
              Decline
            </Button>
          </>
        )}
        {request.status === 'pending' && !iAmRecipient && (
          <p className="text-sm text-stone-600">Waiting for {partnerName} to respond.</p>
        )}
        {request.status === 'rejected' && <p className="text-sm text-stone-600">This request was declined.</p>}

        {(request.status === 'accepted' || request.status === 'completed') && (
          <Button asChild variant="outline">
            <Link href={`/chat/${request.id}`}>
              <MessageCircle className="h-4 w-4" />
              Open chat
            </Link>
          </Button>
        )}
        {request.status === 'accepted' && (
          <Button variant="ghost" disabled={busy} onClick={() => run(() => completeSwap(request.id))} className="text-emerald-800">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Mark as completed
          </Button>
        )}
        {request.status === 'completed' && !reviewed && (
          <Button onClick={() => setReviewing(true)} className="bg-amber-500 text-stone-900 hover:bg-amber-400">
            <Star className="h-4 w-4" />
            Leave a review
          </Button>
        )}
        {request.status === 'completed' && reviewed && (
          <p className="text-sm font-medium text-emerald-800">You reviewed this swap.</p>
        )}
      </div>

      {reviewing && (
        <ReviewDialog
          requestId={request.id}
          partnerId={partnerIdOf(request, meId)}
          partnerName={partnerName}
          onClose={() => setReviewing(false)}
          onSaved={onChanged}
        />
      )}
    </article>
  );
}
