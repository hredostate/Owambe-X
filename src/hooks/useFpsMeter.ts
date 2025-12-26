import { useEffect, useState } from 'react';

export const useFpsMeter = () => {
  const [fpsLow, setFpsLow] = useState(false);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    let frames = 0;

    const tick = (time: number) => {
      frames += 1;
      const delta = time - last;
      if (delta >= 1000) {
        const fps = (frames / delta) * 1000;
        setFpsLow(fps < 45);
        frames = 0;
        last = time;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return { fpsLow };
};
