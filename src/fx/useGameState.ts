import { useEffect, useMemo, useRef, useState } from 'react';
import { clamp } from './format';
import { FastHandsEntry, SprayEvent } from './types';

const COMBO_WINDOW_MS = 6000;
const HEAT_WINDOW_MS = 60_000;
const TABLE_WAR_INTERVAL_MS = 180_000;
const TABLE_WAR_DURATION_MS = 20_000;
const TABLE_WAR_COOLDOWN_MS = 120_000;
const BOSS_TARGET = 20_000_000; // ₦200,000 in kobo

const HEAT_TIERS = [
  { name: 'Warm', threshold: 2_000_000 },
  { name: 'Hot', threshold: 6_000_000 },
  { name: 'Wild', threshold: 12_000_000 },
  { name: 'Nuclear', threshold: 20_000_000 },
] as const;

export interface ComboState {
  level: number;
  endsAt: number | null;
  saveItTriggered: boolean;
  ended: boolean;
}

export interface BossState {
  progress: number;
  activeUntil: number | null;
  cooldownUntil: number | null;
}

export interface TableWarState {
  status: 'idle' | 'active' | 'resolved' | 'cooldown';
  tableA: string | null;
  tableB: string | null;
  scores: Record<string, number>;
  endsAt: number | null;
  winner: string | null;
}

export interface HypeState {
  active: boolean;
  tier: string;
}

const pickRandomTables = () => {
  const tableA = `Table ${Math.floor(Math.random() * 10) + 1}`;
  let tableB = `Table ${Math.floor(Math.random() * 10) + 1}`;
  while (tableB === tableA) {
    tableB = `Table ${Math.floor(Math.random() * 10) + 1}`;
  }
  return { tableA, tableB };
};

export const useGameState = (isDemoMode: boolean) => {
  const [sprays, setSprays] = useState<SprayEvent[]>([]);
  const [combo, setCombo] = useState<ComboState>({ level: 1, endsAt: null, saveItTriggered: false, ended: false });
  const [boss, setBoss] = useState<BossState>({ progress: 0, activeUntil: null, cooldownUntil: null });
  const [tableWar, setTableWar] = useState<TableWarState>({
    status: 'idle',
    tableA: null,
    tableB: null,
    scores: {},
    endsAt: null,
    winner: null,
  });
  const [hype, setHype] = useState<HypeState>({ active: false, tier: 'Warm' });
  const [nudge, setNudge] = useState('');

  const lastHeatTierRef = useRef('Warm');
  const lastTableWarRef = useRef(0);
  const lastNudgeRef = useRef(0);

  const ingestSpray = (spray: SprayEvent) => {
    setSprays((prev) => [spray, ...prev].slice(0, 600));

    setCombo((prev) => {
      const now = Date.now();
      const within = prev.endsAt && prev.endsAt > now;
      return {
        level: within ? Math.min(5, prev.level + 1) : 1,
        endsAt: now + COMBO_WINDOW_MS,
        saveItTriggered: false,
        ended: false,
      };
    });

    if (tableWar.status === 'active') {
      setTableWar((prev) => {
        const recipient = spray.recipient_label.toLowerCase();
        const table = recipient.includes('table') ? spray.recipient_label : null;
        if (!table || (table !== prev.tableA && table !== prev.tableB)) {
          return prev;
        }
        return {
          ...prev,
          scores: { ...prev.scores, [table]: (prev.scores[table] ?? 0) + spray.amount_kobo },
        };
      });
    }
  };

  const heatKobo = useMemo(() => {
    const cutoff = Date.now() - HEAT_WINDOW_MS;
    return sprays.reduce((acc, spray) => {
      if (new Date(spray.created_at).getTime() >= cutoff) {
        return acc + spray.amount_kobo;
      }
      return acc;
    }, 0);
  }, [sprays]);

  const spraysLast60s = useMemo(() => {
    const cutoff = Date.now() - HEAT_WINDOW_MS;
    return sprays.filter((spray) => new Date(spray.created_at).getTime() >= cutoff).length;
  }, [sprays]);

  const heatTier = useMemo(() => {
    const tier = [...HEAT_TIERS].reverse().find((t) => heatKobo >= t.threshold) ?? HEAT_TIERS[0];
    return tier.name;
  }, [heatKobo]);

  useEffect(() => {
    if (heatTier !== lastHeatTierRef.current) {
      lastHeatTierRef.current = heatTier;
      setHype({ active: true, tier: heatTier });
      const timer = window.setTimeout(() => setHype({ active: false, tier: heatTier }), 8000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [heatTier]);

  useEffect(() => {
    const now = Date.now();
    const progress = clamp(heatKobo / BOSS_TARGET, 0, 1);
    setBoss((prev) => {
      if (prev.cooldownUntil && prev.cooldownUntil > now) {
        return { ...prev, progress };
      }
      if (progress >= 1 && (!prev.activeUntil || prev.activeUntil < now)) {
        return {
          progress: 1,
          activeUntil: now + 12_000,
          cooldownUntil: now + 60_000,
        };
      }
      return { ...prev, progress };
    });
  }, [heatKobo]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();

      setCombo((prev) => {
        if (!prev.endsAt) return prev;
        if (prev.endsAt <= now) {
          return { level: 1, endsAt: null, saveItTriggered: false, ended: prev.level > 1 };
        }
        const remaining = prev.endsAt - now;
        if (remaining <= 2000 && !prev.saveItTriggered) {
          return { ...prev, saveItTriggered: true };
        }
        return prev;
      });

      if (heatTier !== 'Warm' && now - lastTableWarRef.current > TABLE_WAR_INTERVAL_MS) {
        lastTableWarRef.current = now;
        const tables = sprays
          .map((spray) => spray.recipient_label)
          .filter((label) => label.toLowerCase().includes('table'));

        if (tables.length >= 2 || isDemoMode) {
          const tableSet = [...new Set(tables)];
          const { tableA, tableB } = tableSet.length >= 2
            ? { tableA: tableSet[0], tableB: tableSet[1] }
            : pickRandomTables();

          setTableWar({
            status: 'active',
            tableA,
            tableB,
            scores: { [tableA]: 0, [tableB]: 0 },
            endsAt: now + TABLE_WAR_DURATION_MS,
            winner: null,
          });
        }
      }

      setTableWar((prev) => {
        if (prev.status !== 'active' || !prev.endsAt) return prev;
        if (prev.endsAt > now) return prev;

        const total = Object.values(prev.scores).reduce((acc, value) => acc + value, 0);
        if (total < 1_000_000) {
          return { status: 'cooldown', tableA: null, tableB: null, scores: {}, endsAt: now + TABLE_WAR_COOLDOWN_MS, winner: null };
        }
        const winner = prev.scores[prev.tableA ?? ''] >= prev.scores[prev.tableB ?? ''] ? prev.tableA : prev.tableB;
        return {
          ...prev,
          status: 'resolved',
          winner: winner ?? null,
          endsAt: now + 8000,
        };
      });

      setTableWar((prev) => {
        if (prev.status === 'resolved' && prev.endsAt && prev.endsAt <= now) {
          return { status: 'cooldown', tableA: null, tableB: null, scores: {}, endsAt: now + TABLE_WAR_COOLDOWN_MS, winner: null };
        }
        if (prev.status === 'cooldown' && prev.endsAt && prev.endsAt <= now) {
          return { status: 'idle', tableA: null, tableB: null, scores: {}, endsAt: null, winner: null };
        }
        return prev;
      });

      if (now - lastNudgeRef.current > 7000) {
        lastNudgeRef.current = now;
        const nudgeText = combo.saveItTriggered ? 'SAVE IT!' : heatTier === 'Hot'
          ? 'Table 4 is catching up!'
          : "Who's next? Keep the combo alive!";
        setNudge(nudgeText);
        window.setTimeout(() => setNudge(''), 2500);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [combo.saveItTriggered, heatTier, isDemoMode, sprays]);

  const comboTimeLeft = combo.endsAt ? Math.max(0, combo.endsAt - Date.now()) : 0;

  const fastHands = useMemo<FastHandsEntry[]>(() => {
    const cutoff = Date.now() - 120_000;
    const counts = new Map<string, number>();
    sprays.forEach((spray) => {
      if (new Date(spray.created_at).getTime() >= cutoff) {
        counts.set(spray.sender_name, (counts.get(spray.sender_name) ?? 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sprays]);

  return {
    heatKobo,
    spraysLast60s,
    heatTier,
    combo,
    comboTimeLeft,
    boss,
    tableWar,
    hype,
    nudge,
    fastHands,
    ingestSpray,
  };
};
