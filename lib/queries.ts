import { supabase } from '@/lib/supabase/client';
import { skillsInCategory, type SkillCategory } from '@/lib/skills';
import type { ChatMessage, MemberPreview, Profile, Review, SwapRequest } from '@/lib/types';

const PROFILE_COLUMNS = 'id, name, bio, location, skills_offered, skills_wanted, created_at, updated_at';
const MEMBER_PREVIEW_COLUMNS = 'id, name, bio, location, skills_offered, skills_wanted';
const SWAP_COLUMNS =
  'id, requester_id, recipient_id, offered_skill, wanted_skill, message, status, created_at, ' +
  'requester:profiles!swap_requests_requester_id_fkey(id, name, location), ' +
  'recipient:profiles!swap_requests_recipient_id_fkey(id, name, location)';
const REVIEW_COLUMNS =
  'id, request_id, reviewer_id, reviewee_id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name)';
const MESSAGE_COLUMNS = 'id, request_id, sender_id, body, created_at';

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export interface DiscoverFilters {
  city: string;
  category: SkillCategory | '';
}

export async function fetchProfile(profileId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', profileId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function updateProfile(
  profileId: string,
  values: Pick<Profile, 'name' | 'bio' | 'location' | 'skills_offered' | 'skills_wanted'>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(values)
    .eq('id', profileId)
    .select(PROFILE_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Profile could not be saved.');
  return data as Profile;
}

// Reciprocal match: they want something I offer AND I want something they offer.
export async function fetchDiscoverMatches(me: Profile, filters: DiscoverFilters): Promise<MemberPreview[]> {
  let query = supabase
    .from('profiles')
    .select(MEMBER_PREVIEW_COLUMNS)
    .neq('id', me.id)
    .overlaps('skills_offered', me.skills_wanted)
    .overlaps('skills_wanted', me.skills_offered);

  if (filters.city) {
    query = query.ilike('location', `%${escapeLike(filters.city)}%`);
  }
  if (filters.category) {
    query = query.overlaps('skills_offered', [...skillsInCategory(filters.category)]);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(60);
  if (error) throw error;
  return (data ?? []) as MemberPreview[];
}

export async function fetchMySwapRequests(): Promise<SwapRequest[]> {
  const { data, error } = await supabase
    .from('swap_requests')
    .select(SWAP_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SwapRequest[];
}

export async function fetchSwapRequest(requestId: string): Promise<SwapRequest | null> {
  const { data, error } = await supabase
    .from('swap_requests')
    .select(SWAP_COLUMNS)
    .eq('id', requestId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as SwapRequest | null) ?? null;
}

export async function createSwapRequest(input: {
  recipient_id: string;
  offered_skill: string;
  wanted_skill: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from('swap_requests').insert(input);
  if (error) throw error;
}

export async function respondToSwap(requestId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc('respond_to_swap', { p_request_id: requestId, p_accept: accept });
  if (error) throw error;
}

export async function completeSwap(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('complete_swap', { p_request_id: requestId });
  if (error) throw error;
}

export async function fetchReviewedRequestIds(reviewerId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('reviews').select('request_id').eq('reviewer_id', reviewerId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.request_id as string));
}

export async function fetchMemberReviews(memberId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('reviewee_id', memberId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

export async function createReview(input: {
  request_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert(input);
  if (error) throw error;
}

export async function fetchMessages(requestId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(requestId: string, body: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ request_id: requestId, body })
    .select(MESSAGE_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Message could not be saved.');
  return data as ChatMessage;
}
