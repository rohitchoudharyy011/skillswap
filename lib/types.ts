export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface MemberSummary {
  id: string;
  name: string;
  location: string;
}

export interface MemberPreview extends MemberSummary {
  bio: string;
  skills_offered: string[];
  skills_wanted: string[];
}

export interface Profile extends MemberPreview {
  created_at: string;
  updated_at: string;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  offered_skill: string;
  wanted_skill: string;
  message: string;
  status: RequestStatus;
  created_at: string;
  requester: MemberSummary | null;
  recipient: MemberSummary | null;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: { name: string } | null;
}
