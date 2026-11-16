'use client';

import { useState, type FormEvent } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { describeDataError } from '@/lib/errors';
import { createSwapRequest } from '@/lib/queries';
import { intersectSkills } from '@/lib/skills';
import type { MemberPreview, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { swapRequestSchema } from '@/lib/validation';

function ChoiceChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (skill: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-800">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((skill) => (
          <button
            key={skill}
            type="button"
            role="radio"
            aria-checked={value === skill}
            onClick={() => onChange(skill)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm capitalize transition',
              value === skill
                ? 'border-emerald-600 bg-emerald-700 text-white'
                : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-400 hover:text-emerald-800',
            )}
          >
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SwapRequestDialog({
  me,
  target,
  onClose,
  onSent,
}: {
  me: Profile;
  target: MemberPreview;
  onClose: () => void;
  onSent: () => void;
}) {
  const offerOptions = intersectSkills(me.skills_offered, target.skills_wanted);
  const wantOptions = intersectSkills(me.skills_wanted, target.skills_offered);
  const [offered, setOffered] = useState(offerOptions[0] ?? '');
  const [wanted, setWanted] = useState(wantOptions[0] ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = swapRequestSchema.safeParse({
      recipient_id: target.id,
      offered_skill: offered,
      wanted_skill: wanted,
      message,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check the form.');
      return;
    }
    setSubmitting(true);
    try {
      await createSwapRequest(parsed.data);
      onSent();
      onClose();
    } catch (err) {
      setError(describeDataError(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Propose a swap with {target.name}</DialogTitle>
          <DialogDescription>Pick the skill you will teach and the one you want in return.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <ChoiceChips label="I will teach" options={offerOptions} value={offered} onChange={setOffered} />
          <ChoiceChips label="I will learn" options={wantOptions} value={wanted} onChange={setWanted} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="swap-message" className="text-sm font-medium text-stone-800">
                Message (optional)
              </label>
              <span className="text-xs text-stone-500">{message.length}/500</span>
            </div>
            <Textarea
              id="swap-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Say hello and suggest a time to start."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !offered || !wanted} className="bg-emerald-700 text-white hover:bg-emerald-800">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
