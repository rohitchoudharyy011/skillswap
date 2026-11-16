import { cn } from '@/lib/utils';
import type { RequestStatus } from '@/lib/types';

const STATUS_STYLES: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-900' },
  accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-900' },
  rejected: { label: 'Declined', className: 'bg-stone-200 text-stone-800' },
  completed: { label: 'Completed', className: 'bg-sky-100 text-sky-900' },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', style.className)}>
      {style.label}
    </span>
  );
}
