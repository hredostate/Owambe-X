import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_ENABLED = 'owambe.sound.enabled';

const SFX_FILES: Record<string, string> = {
  tap: '/sfx/owambe/tap.m4a',
  spray: '/sfx/owambe/spray.m4a',
  combo: '/sfx/owambe/combo.m4a',
  unlock: '/sfx/owambe/unlock.m4a',
  hype: '/sfx/owambe/hype.m4a',
  firework: '/sfx/owambe/firework.m4a',
};

type SfxName = keyof typeof SFX_FILES;

const getStoredEnabled = () => localStorage.getItem(STORAGE_ENABLED) === '1';

export const useSfx = () => {
  const [enabled, setEnabledState] = useState(() => getStoredEnabled());
  const [ready, setReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Map<SfxName, AudioBuffer>>(new Map());
  const loadingRef = useRef(false);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(STORAGE_ENABLED, value ? '1' : '0');
  }, []);

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = AudioCtx ? new AudioCtx() : null;
    }
    return audioContextRef.current;
  }, []);

  const warmUp = useCallback((context: AudioContext) => {
    const buffer = context.createBuffer(1, 1, context.sampleRate);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }, []);

  const loadBuffers = useCallback(async (context: AudioContext) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const entries = Object.entries(SFX_FILES) as [SfxName, string][];
      await Promise.all(entries.map(async ([name, url]) => {
        if (buffersRef.current.has(name)) return;
        const response = await fetch(url);
        const data = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(data.slice(0));
        buffersRef.current.set(name, buffer);
      }));
      setReady(true);
    } catch {
      setEnabled(false);
      setReady(false);
    } finally {
      loadingRef.current = false;
    }
  }, [setEnabled]);

  // iOS requires unlockAudio to be called in a user gesture.
  const unlockAudio = useCallback(async () => {
    const context = ensureContext();
    if (!context) return;
    await context.resume();
    warmUp(context);
    await loadBuffers(context);
    setEnabled(true);
  }, [ensureContext, loadBuffers, setEnabled, warmUp]);

  const play = useCallback((name: SfxName, options?: { volume?: number; rate?: number }) => {
    if (!enabled) return;
    const context = audioContextRef.current;
    const buffer = buffersRef.current.get(name);
    if (!context || !buffer) return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = options?.volume ?? 0.8;
    source.buffer = buffer;
    source.playbackRate.value = options?.rate ?? 1;
    source.connect(gain);
    gain.connect(context.destination);
    source.start(0);
  }, [enabled]);

  useEffect(() => {
    const handleVisibility = () => {
      const context = audioContextRef.current;
      if (document.visibilityState === 'visible' && context && enabled) {
        context.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled]);

  const value = useMemo(() => ({ enabled, setEnabled, ready, unlockAudio, play }), [enabled, setEnabled, ready, unlockAudio, play]);

  return value;
};
