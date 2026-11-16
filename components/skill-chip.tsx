import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SkillChip({
  skill,
  highlighted = false,
  onRemove,
}: {
  skill: string;
  highlighted?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        highlighted ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300' : 'bg-stone-100 text-stone-700',
      )}
    >
      {skill}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${skill}`}
          className="rounded-full p-0.5 text-stone-500 transition hover:bg-stone-200 hover:text-stone-900"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
