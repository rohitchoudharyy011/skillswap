import type { ChatMessage, RequestStatus, SwapRequest } from '@/lib/types';

const OPEN_STATUSES: RequestStatus[] = ['pending', 'accepted'];

export function partnerIdOf(request: SwapRequest, meId: string): string {
  return request.requester_id === meId ? request.recipient_id : request.requester_id;
}

export function openStatusByPartner(requests: SwapRequest[], meId: string): Map<string, RequestStatus> {
  const map = new Map<string, RequestStatus>();
  for (const request of requests) {
    if (OPEN_STATUSES.includes(request.status)) {
      map.set(partnerIdOf(request, meId), request.status);
    }
  }
  return map;
}

export function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const message of [...existing, ...incoming]) byId.set(message.id, message);
  return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
}
