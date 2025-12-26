import { useEffect, useState } from 'react';
import { BadgeId, EarnedBadge } from './types';

const STORAGE_KEY = 'owambe.earnedBadges.v1';
const DAY_MS = 24 * 60 * 60 * 1000;

const readStorage = (): EarnedBadge[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as EarnedBadge[];
  } catch {
    return [];
  }
};

const writeStorage = (records: EarnedBadge[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const awardBadge = (
  badgeId: BadgeId,
  meta?: { source?: string },
): { awarded: boolean; earned: EarnedBadge } => {
  const records = readStorage();
  const now = Date.now();
  const last = records.find((record) => record.badgeId === badgeId);
  if (last && now - new Date(last.earnedAt).getTime() < DAY_MS) {
    return { awarded: false, earned: last };
  }

  const earned: EarnedBadge = {
    badgeId,
    earnedAt: new Date().toISOString(),
    source: meta?.source ?? 'manual',
    privacySafe: true,
  };

  writeStorage([earned, ...records]);
  window.dispatchEvent(new Event('owambe.badges.updated'));
  return { awarded: true, earned };
};

export const useEarnedBadges = () => {
  const [earned, setEarned] = useState<EarnedBadge[]>(() => readStorage());

  useEffect(() => {
    const refresh = () => setEarned(readStorage());
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('owambe.badges.updated', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('owambe.badges.updated', refresh);
    };
  }, []);

  return earned;
};

export const clearEarnedBadges = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('owambe.badges.updated'));
};
