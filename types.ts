export enum EventStatus {
  DRAFT = 'draft',
  LIVE = 'live',
  ENDED = 'ended'
}

export enum PayoutMode {
  INSTANT = 'instant',
  HOLD = 'hold'
}

export enum MemberRole {
  HOST = 'host',
  GUEST = 'guest',
  RECIPIENT = 'recipient'
}

export enum RecipientType {
  CELEBRANT = 'celebrant',
  MC = 'mc',
  DJ = 'dj',
  PARENT = 'parent',
  TABLE = 'table'
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  venue?: string;
  starts_at?: string;
  ends_at?: string;
  status: EventStatus;
  payout_mode: PayoutMode;
  theme: string;
  created_at: string;
}

export interface Recipient {
  id: string;
  event_id: string;
  label: string;
  type: RecipientType;
  payout_profile_user_id?: string;
  table_no?: number;
  is_active: boolean;
}

export interface Spray {
  id: string;
  event_id: string;
  sender_name: string;
  recipient_label: string;
  amount: number;
  burst_count: number;
  vibe_pack: string;
  created_at: string;
}

export interface LeaderboardEntry {
  name: string;
  total_sprayed: number;
}

export interface SprayCreatedPayload {
  spray_id: string;
  sender_name: string;
  recipient_label: string;
  amount: number;
  burst_count: number;
  vibe_pack: string;
  created_at: string;
}
