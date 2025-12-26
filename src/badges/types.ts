export type BadgeId = string;

export interface Badge {
  id: BadgeId;
  title: string;
  subtitle?: string;
  file_1080: string;
  file_512: string;
  captions: string[];
  privacy?: string;
}

export interface BadgeCatalog {
  badges: Badge[];
}

export interface EarnedBadge {
  badgeId: BadgeId;
  earnedAt: string;
  source: string;
  privacySafe: true;
}
