import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLowEndDevice } from './useLowEndDevice';

const COMBO_WINDOW_MS = 6000;
const TAP_COMMIT_DELAY_MS = 350;
const MAX_BURST_NORMAL = 20;
const MAX_BURST_LOW_END = 12;

export const useSprayInput = () => {
  const isLowEnd = useLowEndDevice();
  const burstCap = isLowEnd ? MAX_BURST_LOW_END : MAX_BURST_NORMAL;

  const [burstCount, setBurstCount] = useState(1);
  const [comboLevel, setComboLevel] = useState(1);
  const [comboEndsAt, setComboEndsAt] = useState<number | null>(null);
  const [comboHint, setComboHint] = useState('');
  const [tapCount60s, setTapCount60s] = useState<number[]>([]);

  const tapTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const lastCommitRef = useRef<number | null>(null);

  const comboTimeLeft = useMemo(() => {
    if (!comboEndsAt) return 0;
    return Math.max(0, comboEndsAt - Date.now());
  }, [comboEndsAt]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (comboEndsAt && Date.now() > comboEndsAt) {
        setComboLevel(1);
        setComboEndsAt(null);
        setComboHint('Combo ended');
        window.setTimeout(() => setComboHint(''), 1200);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [comboEndsAt]);

  useEffect(() => {
    if (comboTimeLeft > 0 && comboTimeLeft < 2000) {
      setComboHint('Keep it alive 👀');
    } else if (comboTimeLeft === 0) {
      setComboHint('');
    }
  }, [comboTimeLeft]);

  const bumpCombo = useCallback(() => {
    const now = Date.now();
    setComboLevel((prev) => Math.min(5, prev + 1));
    setComboEndsAt(now + COMBO_WINDOW_MS);
  }, []);

  const registerCommit = useCallback(() => {
    const now = Date.now();
    lastCommitRef.current = now;
    bumpCombo();
    setTapCount60s((prev) => [...prev.filter((t) => now - t < 60000), now]);
  }, [bumpCombo]);

  const incrementBurst = useCallback(() => {
    // Tap/hold bundling: increment burst count locally; commit happens later (debounced).
    setBurstCount((prev) => Math.min(burstCap, prev + 1));
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      tapTimerRef.current = null;
    }, TAP_COMMIT_DELAY_MS);
  }, [burstCap]);

  const resetBurst = useCallback(() => {
    setBurstCount(1);
  }, []);

  const startHold = useCallback(() => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
    }
    holdTimerRef.current = window.setInterval(() => {
      setBurstCount((prev) => Math.min(burstCap, prev + 1));
    }, 160);
  }, [burstCap]);

  const endHold = useCallback(() => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const shouldPreserveComboOnError = useCallback(() => {
    if (!lastCommitRef.current) return false;
    return Date.now() - lastCommitRef.current <= 2000;
  }, []);

  return {
    burstCount,
    setBurstCount,
    comboLevel,
    comboTimeLeft,
    comboHint,
    tapCount60s,
    incrementBurst,
    resetBurst,
    startHold,
    endHold,
    registerCommit,
    shouldPreserveComboOnError,
  };
};
