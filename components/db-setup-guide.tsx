'use client';

import { useState } from 'react';
import { ChevronDown, Database, ExternalLink } from 'lucide-react';

const STEPS = [
  'Click the database icon at the top center of your screen.',
  'Open the Advanced tab.',
  'Click Connect and choose your Supabase project (or create a new one).',
  'Click Connect project, then reload this page.',
];

export function DbSetupGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 text-left"
      >
        <Database className="h-4 w-4 shrink-0 text-amber-700" />
        <span className="flex-1 font-medium text-amber-900">
          First-time setup: connect the database
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-amber-700 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <ol className="space-y-2">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-2.5 text-amber-900">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-semibold text-amber-900">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Need more help? See{' '}
              <a
                href="https://support.bolt.new/integrations/supabase"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2"
              >
                the Supabase setup guide
              </a>
              .
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
