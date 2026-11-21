'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { fetchProfile } from '@/lib/queries';
import type { Profile } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      setProfile(await fetchProfile(userId));
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const applySession = async (session: Session | null) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }
      if (active) setLoading(false);
    };

    // getSession covers the case where the INITIAL_EVENT never fires (blocked storage, iframe sandboxes).
    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => {
        if (active) setLoading(false);
      });

    // Failsafe: never leave the app stuck on the loading spinner.
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile }),
    [user, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// Only for components rendered beneath RequireAuth, which guarantees a loaded profile.
export function useCurrentProfile(): Profile {
  const { profile } = useAuth();
  if (!profile) throw new Error('Profile is not loaded');
  return profile;
}
