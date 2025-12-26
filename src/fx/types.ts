export type VibePack = 'classic' | 'gold' | 'amapiano';

export interface SprayEvent {
  type: 'spray.created';
  event_id: string;
  spray_id: string;
  sender_name: string;
  recipient_label: string;
  amount_kobo: number;
  burst_count: number;
  vibe_pack: VibePack;
  created_at: string;
}

export interface SprayCombo {
  id: string;
  sender_names: string[];
  recipient_label: string;
  amount_kobo: number;
  burst_count: number;
  vibe_pack: VibePack;
  created_at: string;
}

export interface FeedItem {
  id: string;
  sender_name: string;
  recipient_label: string;
  amount_kobo: number;
  created_at: string;
}

export interface LeaderEntry {
  name: string;
  total_kobo: number;
}

export interface FastHandsEntry {
  name: string;
  count: number;
}
