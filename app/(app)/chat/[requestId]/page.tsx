'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { ChatRoom } from '@/components/chat-room';
import { useCurrentProfile } from '@/components/auth-provider';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { describeDataError } from '@/lib/errors';
import { completeSwap, fetchSwapRequest } from '@/lib/queries';
import { partnerIdOf } from '@/lib/swaps';
import type { SwapRequest } from '@/lib/types';

export default function ChatPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const me = useCurrentProfile();
  const [request, setRequest] = useState<SwapRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRequest(await fetchSwapRequest(requestId));
    } catch (err) {
      setError(describeDataError(err));
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleComplete() {
    setCompleting(true);
    setError(null);
    try {
      await completeSwap(requestId);
      await load();
    } catch (err) {
      setError(describeDataError(err));
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-label="Loading chat" />
      </div>
    );
  }

  const chatOpen = request && (request.status === 'accepted' || request.status === 'completed');

  if (!request || !chatOpen) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" className="text-stone-700">
          <Link href="/requests">
            <ArrowLeft className="h-4 w-4" />
            Back to swaps
          </Link>
        </Button>
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="font-medium text-stone-900">This chat is not available</p>
          <p className="mt-2 text-sm text-stone-600">
            Chat opens once the swap request has been accepted.
          </p>
        </div>
      </div>
    );
  }

  const partner = request.requester_id === me.id ? request.recipient : request.requester;
  const partnerName = partner?.name ?? 'Member';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-3 text-stone-700">
            <Link href="/requests">
              <ArrowLeft className="h-4 w-4" />
              Back to swaps
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              <Link href={`/members/${partnerIdOf(request, me.id)}`} className="hover:text-emerald-800">
                {partnerName}
              </Link>
            </h1>
            <StatusBadge status={request.status} />
          </div>
        </div>
        {request.status === 'accepted' && (
          <Button variant="outline" onClick={handleComplete} disabled={completing}>
            {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Mark swap as completed
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </p>
      )}

      <ChatRoom requestId={request.id} meId={me.id} partnerName={partnerName} />
    </div>
  );
}
