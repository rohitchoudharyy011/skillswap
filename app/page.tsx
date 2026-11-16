import Link from 'next/link';
import { ArrowRight, Briefcase, Code2, Leaf, Languages, Music, Palette, Search, ArrowLeftRight, UserRound, Star } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { SKILL_CATALOG, SKILL_CATEGORIES, type SkillCategory } from '@/lib/skills';

const CATEGORY_ICONS: Record<SkillCategory, typeof Code2> = {
  Tech: Code2,
  Design: Palette,
  Languages: Languages,
  Music: Music,
  Business: Briefcase,
  'Life & Home': Leaf,
};

const STEPS = [
  { icon: UserRound, title: 'Share what you know', body: 'List the skills you can teach and the ones you want to learn.' },
  { icon: Search, title: 'Find a two-way match', body: 'See members who want your skills and offer the ones you need.' },
  { icon: ArrowLeftRight, title: 'Swap, chat, and rate', body: 'Agree on a swap, talk in private chat, then leave honest reviews.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Skills for skills, no money involved
            </span>
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-stone-900 sm:text-5xl">
              Trade what you know for what you need.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-stone-600">
              SkillSwap connects neighbors who want to learn with people who can teach. Teach Python, learn Spanish, or
              swap guitar lessons for a website. Every match works both ways.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-emerald-700 px-6 text-white hover:bg-emerald-800">
                <Link href="/signup">
                  Start swapping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-stone-300 bg-white px-6">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-xl">
              <img
                src="https://images.pexels.com/photos/7495161/pexels-photo-7495161.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="A group of people discussing a project around a table"
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg sm:left-auto sm:right-6 sm:w-72">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Example match</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-800">
                <span className="font-semibold">Maya</span> teaches Spanish and wants graphic design.{' '}
                <span className="font-semibold">Jordan</span> teaches graphic design and wants Spanish.
              </p>
              <p className="mt-3 text-xs font-medium text-emerald-800">Ready to swap</p>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900">How it works</h2>
              <p className="text-stone-600">Three simple steps from first profile to finished swap.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-6 text-xs font-medium text-stone-500">Step {index + 1}</p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Skills people trade</h2>
            <p className="text-stone-600">From code and languages to cooking and music, there is something to swap.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <div key={category} className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md">
                  <Icon className="h-6 w-6 text-emerald-700 transition group-hover:scale-110" />
                  <h3 className="mt-4 font-semibold text-stone-900">{category}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {SKILL_CATALOG[category].slice(0, 4).join(', ')}, and more.
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-stone-900 p-8 sm:flex-row sm:items-center sm:p-12">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Your next skill is one swap away.</h2>
              <p className="text-stone-300">Create a free profile and find a match in minutes.</p>
            </div>
            <Button asChild size="lg" className="h-12 shrink-0 bg-emerald-500 px-6 font-semibold text-stone-950 hover:bg-emerald-400">
              <Link href="/signup">Create your profile</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-medium text-stone-700">SkillSwap</span>
          <span>Trade skills, not money.</span>
        </div>
      </footer>
    </div>
  );
}
