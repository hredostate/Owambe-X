import { useMemo } from 'react';
import { clamp } from './format';
import { VibePack } from './types';
import { useLowEndDevice } from '../hooks/useLowEndDevice';
import { useFpsMeter } from '../hooks/useFpsMeter';

const getVibeFactor = (vibe: VibePack) => {
  switch (vibe) {
    case 'gold':
      return 1.4;
    case 'amapiano':
      return 1.2;
    default:
      return 1;
  }
};

export interface FxBudget {
  useCanvas: boolean;
  maxParticles: number;
  targetParticles: number;
  reducedMotion: boolean;
  qualityLabel: 'Auto' | 'High' | 'Low';
}

export const useFxBudget = (vibe: VibePack, burstCount: number, performanceMode: boolean) => {
  const isLowEnd = useLowEndDevice();
  const { fpsLow } = useFpsMeter();

  return useMemo<FxBudget>(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const maxParticles = performanceMode ? 120 : 250;
    const vibeFactor = getVibeFactor(vibe);
    const rawTarget = Math.round(burstCount * 2 * vibeFactor);
    const targetParticles = clamp(rawTarget, performanceMode ? 12 : 24, maxParticles);

    const useCanvas = performanceMode || isLowEnd || reducedMotion || fpsLow;

    return {
      useCanvas,
      maxParticles,
      targetParticles,
      reducedMotion,
      qualityLabel: performanceMode ? 'Low' : useCanvas ? 'Auto' : 'High',
    };
  }, [burstCount, fpsLow, isLowEnd, performanceMode, vibe]);
};
