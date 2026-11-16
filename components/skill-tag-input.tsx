'use client';

import { useState, type KeyboardEvent } from 'react';
import { ALL_SKILLS } from '@/lib/skills';
import { normalizeSkill } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { SkillChip } from '@/components/skill-chip';

const MAX_SUGGESTIONS = 8;

interface SkillTagInputProps {
  id: string;
  label: string;
  hint: string;
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}

export function SkillTagInput({ id, label, hint, value, onChange, error }: SkillTagInputProps) {
  const [draft, setDraft] = useState('');
  const query = normalizeSkill(draft);

  const suggestions = ALL_SKILLS.filter(
    (skill) => !value.includes(skill) && (query === '' || skill.includes(query)),
  ).slice(0, MAX_SUGGESTIONS);

  function addSkill(raw: string) {
    const skill = normalizeSkill(raw);
    if (skill && !value.includes(skill)) onChange([...value, skill]);
    setDraft('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill(draft);
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
      <div
        className={cn(
          'mt-2 flex min-h-11 flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2 transition focus-within:ring-2 focus-within:ring-emerald-500/40',
          error ? 'border-red-400' : 'border-stone-300',
        )}
      >
        {value.map((skill) => (
          <SkillChip key={skill} skill={skill} onRemove={() => onChange(value.filter((s) => s !== skill))} />
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(draft)}
          placeholder={value.length ? 'Add another skill' : 'e.g. Python, Guitar'}
          maxLength={40}
          aria-invalid={Boolean(error)}
          className="min-w-[140px] flex-1 bg-transparent py-1 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addSkill(skill)}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs capitalize text-stone-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
            >
              + {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
