import { useMemo } from 'react';

export const useLowEndDevice = () => {
  return useMemo(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;

    return reducedMotion || deviceMemory <= 3 || cores <= 4;
  }, []);
};
