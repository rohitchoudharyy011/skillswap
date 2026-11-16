'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Inbox } from 'lucide-react';
import { SwapRequestCard } from '@/components/swap-request-card';
import { useCurrentProfile } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { describeDataError } from '@/lib/errors';
import { fetchMySwapRequests, fetchReviewedRequestIds } from '@/lib/queries';
import type { SwapRequest } from '@/lib/types';

type Tab = 'incoming' | 'outgoing';

export default function RequestsPage() {
  const me = useCurrentProfile();
  const [tab, setTab] = useState<Tab>('incoming');
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [rows, reviewed] = await Promise.all([fetchMySwapRequests(), fetchReviewedRequestIds(me.id)]);
      setRequests(rows);
      setReviewedIds(reviewed);
    } catch (err) {
      setError(describeDataError(err));
    } finally {
      setLoading(false);
    }
  }, [me.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const incoming = requests.filter((r) => r.recipient_id === me.id);
  const outgoing = requests.filter((r) => r.requester_id === me.id);
  const visible = tab === 'incoming' ? incoming : outgoing;
  const pendingIncoming = incoming.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Swaps</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
          Respond to requests, open chats with accepted partners, and rate completed swaps.
        </p>
      </div>

      <div role="tablist" className="inline-flex rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
        {(['incoming', 'outgoing'] as const).map((value) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === value ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {value === 'incoming' ? 'Received' : 'Sent'}
            {value === 'incoming' && pendingIncoming > 0 && (
              <span className={`rounded-full px-2 text-xs ${tab === value ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                {pendingIncoming}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-label="Loading swaps" />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900">
          <AlertTriangle className="h-6 w-6" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <Inbox className="h-8 w-8 text-stone-400" />
          <p className="font-medium text-stone-900">
            {tab === 'incoming' ? 'No requests received yet' : 'You have not sent any requests yet'}
          </p>
          <p className="max-w-sm text-sm text-stone-600">Browse Discover to find someone with a matching swap.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {visible.map((request) => (
            <SwapRequestCard
              key={request.id}
              request={request}
              meId={me.id}
              reviewed={reviewedIds.has(request.id)}
              onChanged={() => void load()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
