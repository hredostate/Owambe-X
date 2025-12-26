import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp } from './format';
import { FeedItem, LeaderEntry, SprayCombo, SprayEvent, VibePack } from './types';

const COMBO_WINDOW_MS = 200;
const FEED_LIMIT = 10;
const HISTORY_LIMIT = 220;

interface SprayHistoryItem {
  sender_name: string;
  recipient_label: string;
  amount_kobo: number;
  created_at: string;
}

const mergeVibe = (current: VibePack, next: VibePack) => {
  if (current === 'gold' || next === 'gold') return 'gold';
  if (current === 'amapiano' || next === 'amapiano') return 'amapiano';
  return 'classic';
};

export const useSprayQueue = () => {
  const [currentCombo, setCurrentCombo] = useState<SprayCombo | null>(null);
  const [queue, setQueue] = useState<SprayCombo[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [history, setHistory] = useState<SprayHistoryItem[]>([]);
  const gameQueueRef = useRef<SprayEvent[]>([]);
  const lastComboRef = useRef<SprayCombo | null>(null);

  const enqueueSpray = useCallback((spray: SprayEvent) => {
    const now = Date.now();
    const lastCombo = lastComboRef.current;

    setFeed((prev) => [
      { id: spray.spray_id, sender_name: spray.sender_name, recipient_label: spray.recipient_label, amount_kobo: spray.amount_kobo, created_at: spray.created_at },
      ...prev,
    ].slice(0, FEED_LIMIT));

    setHistory((prev) => [
      { sender_name: spray.sender_name, recipient_label: spray.recipient_label, amount_kobo: spray.amount_kobo, created_at: spray.created_at },
      ...prev,
    ].slice(0, HISTORY_LIMIT));

    gameQueueRef.current.push(spray);

    if (lastCombo && now - new Date(lastCombo.created_at).getTime() < COMBO_WINDOW_MS) {
      const merged: SprayCombo = {
        ...lastCombo,
        sender_names: Array.from(new Set([...lastCombo.sender_names, spray.sender_name])).slice(0, 3),
        amount_kobo: lastCombo.amount_kobo + spray.amount_kobo,
        burst_count: lastCombo.burst_count + spray.burst_count,
        vibe_pack: mergeVibe(lastCombo.vibe_pack, spray.vibe_pack),
        created_at: spray.created_at,
      };
      lastComboRef.current = merged;
      setQueue((prev) => [merged, ...prev.slice(1)]);
      return;
    }

    const combo: SprayCombo = {
      id: `combo-${spray.spray_id}`,
      sender_names: [spray.sender_name],
      recipient_label: spray.recipient_label,
      amount_kobo: spray.amount_kobo,
      burst_count: spray.burst_count,
      vibe_pack: spray.vibe_pack,
      created_at: spray.created_at,
    };

    lastComboRef.current = combo;
    setQueue((prev) => [...prev, combo]);
  }, []);

  useEffect(() => {
    if (currentCombo || queue.length === 0) return;
    setCurrentCombo(queue[0]);
    setQueue((prev) => prev.slice(1));
    const timer = window.setTimeout(() => {
      setCurrentCombo(null);
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [currentCombo, queue]);

  const consumeGameQueue = useCallback(() => {
    const payload = [...gameQueueRef.current];
    gameQueueRef.current = [];
    return payload;
  }, []);

  const leaderboard = useMemo(() => {
    const sprayers = new Map<string, number>();
    const sprayers10m = new Map<string, number>();
    const recipients = new Map<string, number>();
    const tenMinCutoff = Date.now() - 600_000;

    history.forEach((item) => {
      sprayers.set(item.sender_name, (sprayers.get(item.sender_name) ?? 0) + item.amount_kobo);
      recipients.set(item.recipient_label, (recipients.get(item.recipient_label) ?? 0) + item.amount_kobo);
      if (new Date(item.created_at).getTime() >= tenMinCutoff) {
        sprayers10m.set(item.sender_name, (sprayers10m.get(item.sender_name) ?? 0) + item.amount_kobo);
      }
    });

    const topSprayers: LeaderEntry[] = Array.from(sprayers.entries())
      .map(([name, total_kobo]) => ({ name, total_kobo }))
      .sort((a, b) => b.total_kobo - a.total_kobo)
      .slice(0, 5);

    const topSprayers10m: LeaderEntry[] = Array.from(sprayers10m.entries())
      .map(([name, total_kobo]) => ({ name, total_kobo }))
      .sort((a, b) => b.total_kobo - a.total_kobo)
      .slice(0, 5);

    const topRecipients: LeaderEntry[] = Array.from(recipients.entries())
      .map(([name, total_kobo]) => ({ name, total_kobo }))
      .sort((a, b) => b.total_kobo - a.total_kobo)
      .slice(0, 5);

    return { topSprayers, topSprayers10m, topRecipients };
  }, [history]);

  const heatLast60s = useMemo(() => {
    const cutoff = Date.now() - 60_000;
    const sum = history.reduce((acc, item) => {
      if (new Date(item.created_at).getTime() >= cutoff) {
        return acc + item.amount_kobo;
      }
      return acc;
    }, 0);

    return clamp(sum, 0, 100_000_000);
  }, [history]);

  return { enqueueSpray, consumeGameQueue, currentCombo, feed, leaderboard, heatLast60s };
};
