'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Star, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { ProfileForm } from '@/components/profile-form';
import { SkillChip } from '@/components/skill-chip';
import { useCurrentProfile } from '@/components/auth-provider';
import { StarRating } from '@/components/star-rating';
import { describeDataError } from '@/lib/errors';
import { fetchMemberReviews } from '@/lib/queries';
import { summarizeRatings, type RatingSummary } from '@/lib/ratings';

export default function ProfilePage() {
  const profile = useCurrentProfile();
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMemberReviews(profile.id)
      .then((reviews) => {
        if (!cancelled) setSummary(summarizeRatings(reviews));
      })
      .catch((err) => {
        if (!cancelled) setSummaryError(describeDataError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const needsSkills = profile.skills_offered.length === 0 || profile.skills_wanted.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Your profile</h1>
          <p className="max-w-xl text-sm leading-relaxed text-stone-600">
            Keep your skills current so the right people can find you.
          </p>
          {profile.location && (
            <p className="flex items-center gap-1.5 text-sm text-stone-600">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Your rating</p>
          {summaryError ? (
            <p className="mt-2 text-sm text-red-700">{summaryError}</p>
          ) : summary === null ? (
            <Loader2 className="mt-2 h-4 w-4 animate-spin text-stone-400" />
          ) : summary.count === 0 ? (
            <p className="mt-2 text-sm text-stone-600">No reviews yet</p>
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl font-semibold text-stone-900">{summary.average?.toFixed(1)}</span>
              <div>
                <StarRating value={Math.round(summary.average ?? 0)} />
                <p className="mt-1 text-xs text-stone-500">
                  {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {needsSkills && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div className="space-y-1">
            <p className="font-medium">Add skills on both sides to start matching</p>
            <p className="text-sm text-emerald-900">
              List at least one skill you can teach and one you want to learn. Then head to{' '}
              <Link href="/discover" className="inline-flex items-center gap-1 font-medium underline underline-offset-4">
                Discover
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {profile.skills_offered.map((skill) => (
          <SkillChip key={`offer-${skill}`} skill={skill} highlighted />
        ))}
        {profile.skills_wanted.map((skill) => (
          <SkillChip key={`want-${skill}`} skill={skill} />
        ))}
      </div>

      <ProfileForm key={profile.updated_at} profile={profile} />
    </div>
  );
}
