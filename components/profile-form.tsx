'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { SkillTagInput } from '@/components/skill-tag-input';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { describeDataError } from '@/lib/errors';
import { updateProfile } from '@/lib/queries';
import type { Profile } from '@/lib/types';
import { collectFieldErrors, profileSchema } from '@/lib/validation';

export function ProfileForm({ profile }: { profile: Profile }) {
  const { refreshProfile } = useAuth();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [offered, setOffered] = useState<string[]>(profile.skills_offered);
  const [wanted, setWanted] = useState<string[]>(profile.skills_wanted);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setFormError(null);

    const parsed = profileSchema.safeParse({
      name,
      bio,
      location,
      skills_offered: offered,
      skills_wanted: wanted,
    });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      await updateProfile(profile.id, parsed.data);
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setFormError(describeDataError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      {formError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-stone-900">About you</h2>
          <p className="mt-1 text-sm text-stone-500">This is what other members see when they consider a swap.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              aria-invalid={Boolean(fieldErrors.name)}
              className="h-11"
            />
            {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-location">City or area</Label>
            <Input
              id="profile-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Brooklyn, NY"
              maxLength={80}
              aria-invalid={Boolean(fieldErrors.location)}
              className="h-11"
            />
            {fieldErrors.location && <p className="text-xs text-red-600">{fieldErrors.location}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-bio">Bio</Label>
            <span className="text-xs text-stone-500">{bio.length}/500</span>
          </div>
          <Textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Tell neighbors what you enjoy teaching and learning."
            aria-invalid={Boolean(fieldErrors.bio)}
          />
          {fieldErrors.bio && <p className="text-xs text-red-600">{fieldErrors.bio}</p>}
        </div>
      </section>

      <section className="space-y-6 border-t border-stone-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Your skills</h2>
          <p className="mt-1 text-sm text-stone-500">Matches appear only when your lists and another member&apos;s lists overlap both ways.</p>
        </div>
        <SkillTagInput
          id="skills-offered"
          label="Skills I can teach"
          hint="Press Enter or comma to add. Up to 15."
          value={offered}
          onChange={setOffered}
          error={fieldErrors.skills_offered}
        />
        <SkillTagInput
          id="skills-wanted"
          label="Skills I want to learn"
          hint="Press Enter or comma to add. Up to 15."
          value={wanted}
          onChange={setWanted}
          error={fieldErrors.skills_wanted}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-800">
          {saved && (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Profile saved.
            </>
          )}
        </p>
        <Button type="submit" disabled={saving} className="h-11 bg-emerald-700 px-6 text-white hover:bg-emerald-800">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}
