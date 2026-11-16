'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  value,
  onChange,
  size = 'sm',
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'lg';
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const iconClass = size === 'lg' ? 'h-8 w-8' : 'h-4 w-4';

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={cn(iconClass, star <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300')} />
        ))}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1" onMouseLeave={() => setHover(null)} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
          className="rounded p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Star className={cn(iconClass, star <= shown ? 'fill-amber-400 text-amber-400' : 'text-stone-300')} />
        </button>
      ))}
    </div>
  );
}
