'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { describeDataError } from '@/lib/errors';
import { fetchMessages, sendMessage } from '@/lib/queries';
import { supabase } from '@/lib/supabase/client';
import { mergeMessages } from '@/lib/swaps';
import type { ChatMessage } from '@/lib/types';
import { messageSchema } from '@/lib/validation';

export function ChatRoom({
  requestId,
  meId,
  partnerName,
}: {
  requestId: string;
  meId: string;
  partnerName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMessages(requestId)
      .then((rows) => {
        if (!cancelled) setMessages((prev) => mergeMessages(prev, rows));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(describeDataError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const channel = supabase
      .channel(`swap-messages-${requestId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${requestId}` },
        (payload) => {
          const row = payload.new as ChatMessage;
          if (!cancelled) setMessages((prev) => mergeMessages(prev, [row]));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendError(null);
    const parsed = messageSchema.safeParse({ body: draft });
    if (!parsed.success) {
      setSendError(parsed.error.issues[0]?.message ?? 'Message is not valid.');
      return;
    }
    setSending(true);
    try {
      const row = await sendMessage(requestId, parsed.data.body);
      setMessages((prev) => mergeMessages(prev, [row]));
      setDraft('');
    } catch (err) {
      setSendError(describeDataError(err));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4 sm:p-6" aria-live="polite">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" aria-label="Loading messages" />
          </div>
        )}
        {loadError && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {loadError}
          </p>
        )}
        {!loading && !loadError && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-500">No messages yet. Say hello to {partnerName}.</p>
        )}
        {messages.map((message) => {
          const mine = message.sender_id === meId;
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  mine ? 'rounded-br-md bg-emerald-700 text-white' : 'rounded-bl-md border border-stone-200 bg-white text-stone-900'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p className={`mt-1 text-[11px] ${mine ? 'text-emerald-100' : 'text-stone-500'}`}>
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="border-t border-stone-200 bg-white p-3 sm:p-4">
        {sendError && (
          <p role="alert" className="mb-2 text-xs text-red-700">
            {sendError}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            placeholder="Write a message. Enter to send, Shift+Enter for a new line."
            aria-label="Message"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <Button type="submit" disabled={sending || !draft.trim()} className="h-11 bg-emerald-700 px-4 text-white hover:bg-emerald-800">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
