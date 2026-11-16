'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
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
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          await loadProfile(nextUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });
    return () => subscription.subscription.unsubscribe();
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
