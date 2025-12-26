import { useCallback, useMemo } from 'react';

export const useHaptics = () => {
  const supported = useMemo(() => 'vibrate' in navigator, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!supported) return;
    navigator.vibrate(pattern);
  }, [supported]);

  return { supported, vibrate };
};
