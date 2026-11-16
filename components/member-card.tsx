import Link from 'next/link';
import { MapPin, Send } from 'lucide-react';
import { SkillChip } from '@/components/skill-chip';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { intersectSkills } from '@/lib/skills';
import type { MemberPreview, Profile, RequestStatus } from '@/lib/types';

export function MemberCard({
  member,
  me,
  openStatus,
  onRequest,
}: {
  member: MemberPreview;
  me: Profile;
  openStatus: RequestStatus | undefined;
  onRequest: () => void;
}) {
  const theyTeachMe = intersectSkills(me.skills_wanted, member.skills_offered);
  const iTeachThem = intersectSkills(me.skills_offered, member.skills_wanted);
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <article className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900">
          {initials || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/members/${member.id}`} className="block truncate font-semibold text-stone-900 hover:text-emerald-800">
            {member.name}
          </Link>
          {member.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{member.location}</span>
            </p>
          )}
        </div>
      </div>

      {member.bio && <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-stone-600">{member.bio}</p>}

      <div className="mt-5 space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-stone-500">Teaches you</p>
          <div className="flex flex-wrap gap-1.5">
            {theyTeachMe.map((skill) => (
              <SkillChip key={skill} skill={skill} highlighted />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-stone-500">Wants to learn</p>
          <div className="flex flex-wrap gap-1.5">
            {iTeachThem.map((skill) => (
              <SkillChip key={skill} skill={skill} highlighted />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-stone-100 pt-4">
        {openStatus ? (
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={openStatus} />
            <Link href="/requests" className="text-sm font-medium text-emerald-700 hover:underline">
              View swaps
            </Link>
          </div>
        ) : (
          <Button onClick={onRequest} className="w-full bg-emerald-700 text-white hover:bg-emerald-800">
            <Send className="h-4 w-4" />
            Propose a swap
          </Button>
        )}
      </div>
    </article>
  );
}
