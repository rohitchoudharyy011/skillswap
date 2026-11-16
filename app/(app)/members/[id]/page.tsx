'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Loader2, MapPin, Send } from 'lucide-react';
import { SkillChip } from '@/components/skill-chip';
import { StarRating } from '@/components/star-rating';
import { StatusBadge } from '@/components/status-badge';
import { SwapRequestDialog } from '@/components/swap-request-dialog';
import { useCurrentProfile } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { describeDataError } from '@/lib/errors';
import { fetchMemberReviews, fetchMySwapRequests, fetchProfile } from '@/lib/queries';
import { intersectSkills } from '@/lib/skills';
import { summarizeRatings } from '@/lib/ratings';
import { openStatusByPartner } from '@/lib/swaps';
import type { MemberPreview, Review, RequestStatus } from '@/lib/types';

export default function MemberPage() {
  const { id } = useParams<{ id: string }>();
  const me = useCurrentProfile();
  const [member, setMember] = useState<MemberPreview | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openStatus, setOpenStatus] = useState<RequestStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [profile, memberReviews, requests] = await Promise.all([
        fetchProfile(id),
        fetchMemberReviews(id),
        fetchMySwapRequests(),
      ]);
      setMember(profile);
      setReviews(memberReviews);
      setOpenStatus(openStatusByPartner(requests, me.id).get(id));
    } catch (err) {
      setError(describeDataError(err));
    } finally {
      setLoading(false);
    }
  }, [id, me.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-label="Loading member" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="font-medium text-stone-900">This member could not be found.</p>
        <Link href="/discover" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const isMe = member.id === me.id;
  const summary = summarizeRatings(reviews);
  const theyTeachMe = intersectSkills(me.skills_wanted, member.skills_offered);
  const iTeachThem = intersectSkills(me.skills_offered, member.skills_wanted);
  const canPropose = !isMe && theyTeachMe.length > 0 && iTeachThem.length > 0;
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-3 text-stone-700">
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>
      </Button>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-900">
              {initials || '?'}
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{member.name}</h1>
              {member.location && (
                <p className="flex items-center gap-1.5 text-sm text-stone-600">
                  <MapPin className="h-4 w-4" />
                  {member.location}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                {summary.average === null ? (
                  <span className="text-sm text-stone-500">No reviews yet</span>
                ) : (
                  <>
                    <StarRating value={Math.round(summary.average)} />
                    <span className="text-sm font-medium text-stone-800">{summary.average.toFixed(1)}</span>
                    <span className="text-sm text-stone-500">({summary.count})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {isMe ? (
              <Button asChild variant="outline">
                <Link href="/profile">Edit your profile</Link>
              </Button>
            ) : openStatus ? (
              <div className="flex items-center gap-3">
                <StatusBadge status={openStatus} />
                <Link href="/requests" className="text-sm font-medium text-emerald-700 hover:underline">
                  View swaps
                </Link>
              </div>
            ) : canPropose ? (
              <Button onClick={() => setProposing(true)} className="bg-emerald-700 text-white hover:bg-emerald-800">
                <Send className="h-4 w-4" />
                Propose a swap
              </Button>
            ) : (
              <p className="max-w-xs text-sm text-stone-500">
                No skill overlap with you yet, so a swap is not possible.
              </p>
            )}
          </div>
        </div>

        {member.bio && <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700">{member.bio}</p>}

        <div className="mt-8 grid gap-6 border-t border-stone-100 pt-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">Can teach</p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills_offered.map((skill) => (
                <SkillChip key={skill} skill={skill} highlighted={theyTeachMe.includes(skill)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">Wants to learn</p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills_wanted.map((skill) => (
                <SkillChip key={skill} skill={skill} highlighted={iTeachThem.includes(skill)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
            No reviews yet. Reviews appear after a completed swap.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <StarRating value={review.rating} />
                  <span className="text-xs text-stone-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700">{review.comment}</p>
                )}
                <p className="mt-3 text-xs font-medium text-stone-600">{review.reviewer?.name ?? 'Member'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {proposing && (
        <SwapRequestDialog
          me={me}
          target={member}
          onClose={() => setProposing(false)}
          onSent={() => void load()}
        />
      )}
    </div>
  );
}
