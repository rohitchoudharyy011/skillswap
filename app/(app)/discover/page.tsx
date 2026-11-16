'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, MapPin, Sparkles, Users } from 'lucide-react';
import { MemberCard } from '@/components/member-card';
import { SwapRequestDialog } from '@/components/swap-request-dialog';
import { useCurrentProfile } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { describeDataError } from '@/lib/errors';
import { fetchDiscoverMatches, fetchMySwapRequests } from '@/lib/queries';
import { SKILL_CATEGORIES, type SkillCategory } from '@/lib/skills';
import { openStatusByPartner } from '@/lib/swaps';
import type { MemberPreview, RequestStatus } from '@/lib/types';

export default function DiscoverPage() {
  const me = useCurrentProfile();
  const [city, setCity] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');
  const [category, setCategory] = useState<SkillCategory | ''>('');
  const [members, setMembers] = useState<MemberPreview[]>([]);
  const [statuses, setStatuses] = useState<Map<string, RequestStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<MemberPreview | null>(null);

  const hasSkills = me.skills_offered.length > 0 && me.skills_wanted.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(city.trim()), 300);
    return () => clearTimeout(timer);
  }, [city]);

  const load = useCallback(async () => {
    if (!hasSkills) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [matches, requests] = await Promise.all([
        fetchDiscoverMatches(me, { city: debouncedCity, category }),
        fetchMySwapRequests(),
      ]);
      setMembers(matches);
      setStatuses(openStatusByPartner(requests, me.id));
    } catch (err) {
      setError(describeDataError(err));
    } finally {
      setLoading(false);
    }
  }, [me, hasSkills, debouncedCity, category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Discover</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
          Members who want what you offer and offer what you want. Every match works both ways.
        </p>
      </div>

      {!hasSkills ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="space-y-1">
            <p className="font-medium">Add your skills to see matches</p>
            <p className="text-sm text-amber-900">
              <Link href="/profile" className="font-medium underline underline-offset-4">
                Open your profile
              </Link>{' '}
              and list at least one skill you teach and one you want to learn.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px] sm:p-5">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Filter by city or area"
                maxLength={80}
                aria-label="Filter by city or area"
                className="h-11 pl-9"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory | '')}
              aria-label="Filter by skill category"
              className="h-11 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">All categories</option>
              {SKILL_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-label="Loading matches" />
            </div>
          ) : error ? (
            <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900">
              <AlertTriangle className="h-6 w-6" />
              <p className="text-sm">{error}</p>
              <Button variant="outline" onClick={() => void load()}>
                Try again
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
              <Users className="h-8 w-8 text-stone-400" />
              <p className="font-medium text-stone-900">No matches yet</p>
              <p className="max-w-sm text-sm text-stone-600">
                Try clearing the filters, or add more skills to your profile to widen your reach.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  me={me}
                  openStatus={statuses.get(member.id)}
                  onRequest={() => setTarget(member)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {target && (
        <SwapRequestDialog
          me={me}
          target={target}
          onClose={() => setTarget(null)}
          onSent={() => void load()}
        />
      )}
    </div>
  );
}
