'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeftRight, Inbox, LogOut, Search, UserRound } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/requests', label: 'Swaps', icon: Inbox },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function SiteHeader() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      return;
    }
    router.replace('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={user ? '/discover' : '/'} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">SkillSwap</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <nav aria-label="Main" className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors sm:px-3',
                      active
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            {profile && (
              <span className="hidden max-w-[140px] truncate px-2 text-sm text-stone-500 lg:inline">
                {profile.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-stone-600 hover:text-stone-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign out'}</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-stone-700">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="bg-emerald-700 text-white hover:bg-emerald-800">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
