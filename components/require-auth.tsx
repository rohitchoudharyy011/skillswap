'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { DbSetupGuide } from '@/components/db-setup-guide';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-label="Loading" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
        <p className="text-base font-medium text-stone-900">We could not load your profile.</p>
        <p className="max-w-sm text-sm text-stone-600">Check your connection and try again.</p>
        <Button variant="outline" onClick={() => void refreshProfile()}>
          Try again
        </Button>
        {!isSupabaseConfigured && <DbSetupGuide />}
      </div>
    );
  }

  return <>{children}</>;
}
