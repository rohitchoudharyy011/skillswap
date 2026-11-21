'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DbSetupGuide } from '@/components/db-setup-guide';
import { describeAuthError } from '@/lib/errors';
import { supabase } from '@/lib/supabase/client';
import { collectFieldErrors, loginSchema, signUpSchema } from '@/lib/validation';

type Mode = 'login' | 'signup';

const COPY = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to pick up your swaps and conversations.',
    submit: 'Log in',
    alternate: 'New to SkillSwap?',
    alternateLink: { href: '/signup', label: 'Create an account' },
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Start trading skills with people nearby in minutes.',
    submit: 'Create account',
    alternate: 'Already a member?',
    alternateLink: { href: '/login', label: 'Log in' },
  },
} as const;

function safeNextPath(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/discover';
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const isSignup = mode === 'signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    if (isSignup) {
      const parsed = signUpSchema.safeParse({ name, email, password });
      if (!parsed.success) {
        setFieldErrors(collectFieldErrors(parsed.error));
        return;
      }
      setFieldErrors({});
      setSubmitting(true);
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { name: parsed.data.name } },
      });
      setSubmitting(false);
      if (error) {
        setFormError(describeAuthError(error));
        return;
      }
      if (data.session) {
        router.replace('/profile');
      } else {
        setNotice('Check your inbox to confirm your email address, then log in.');
      }
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) {
      setFormError(describeAuthError(error));
      return;
    }
    router.replace(safeNextPath());
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{copy.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{copy.subtitle}</p>
        </div>

        {formError && (
          <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        {formError && formError.includes('database connection is not set up') && <DbSetupGuide />}

        {notice && (
          <div role="status" className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                placeholder="Alex Morgan"
                maxLength={60}
                className="h-11"
              />
              {fieldErrors.name && (
                <p id="name-error" className="text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              placeholder="you@example.com"
              className="h-11"
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isSignup && <span className="text-xs text-stone-500">At least 8 characters</span>}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className="h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full bg-emerald-700 text-white hover:bg-emerald-800"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                {copy.submit}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-600">
        {copy.alternate}{' '}
        <Link href={copy.alternateLink.href} className="font-medium text-emerald-700 underline-offset-4 hover:underline">
          {copy.alternateLink.label}
        </Link>
      </p>
    </div>
  );
}
