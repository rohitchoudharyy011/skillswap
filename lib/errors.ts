import { isSupabaseConfigured } from '@/lib/supabase/client';

interface ErrorLike {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

const NOT_CONFIGURED_MESSAGE =
  'The database connection is not set up for this app yet. Reconnect the database in your project settings and try again.';
const NETWORK_MESSAGE = 'Network problem. Check your connection and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

function isNetworkFailure(error: ErrorLike, message: string): boolean {
  return error.status === 0 || error.name === 'AuthRetryableFetchError' || message.includes('failed to fetch');
}

export function describeAuthError(error: unknown): string {
  const e = (error ?? {}) as ErrorLike;
  const message = (e.message ?? '').toLowerCase();

  if (!isSupabaseConfigured) return NOT_CONFIGURED_MESSAGE;
  if (isNetworkFailure(e, message)) return NETWORK_MESSAGE;
  if (message.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('email not confirmed')) return 'Please confirm your email address before signing in.';
  if (e.status === 429 || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (message.includes('password')) return 'Password does not meet the requirements.';
  return GENERIC_MESSAGE;
}

export function describeDataError(error: unknown): string {
  const e = (error ?? {}) as ErrorLike;
  const message = (e.message ?? '').toLowerCase();

  if (!isSupabaseConfigured) return NOT_CONFIGURED_MESSAGE;
  if (isNetworkFailure(e, message)) return NETWORK_MESSAGE;
  switch (e.code) {
    case '23505':
      return 'You already have an open swap with this member.';
    case '23514':
      return 'Some details are invalid. Please review your input.';
    case '42501':
      return 'That action is not allowed right now. Refresh the page and try again.';
    default:
      return GENERIC_MESSAGE;
  }
}
