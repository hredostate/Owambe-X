import { useCallback, useEffect, useRef, useState } from 'react';
import { SprayEvent, VibePack } from '../fx/types';

const randomFrom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const senderPool = ['Tayo A.', 'Chioma', 'Obi', 'DJ Lush', 'Ife', 'Kemi'];
const recipientPool = ['Celebrant', 'MC', 'DJ', 'Parents', 'Table 3', 'Table 7'];

const createSpray = (): SprayEvent => {
  const amount = randomFrom([200, 500, 1000, 2000, 5000, 10000, 20000]);
  const burst = randomFrom([6, 8, 12, 16, 24, 32, 40]);
  const vibe = randomFrom(['classic', 'gold', 'amapiano'] as VibePack[]);
  return {
    type: 'spray.created',
    event_id: 'demo-event',
    spray_id: crypto.randomUUID(),
    sender_name: randomFrom(senderPool),
    recipient_label: randomFrom(recipientPool),
    amount_kobo: amount * 100,
    burst_count: burst,
    vibe_pack: vibe,
    created_at: new Date().toISOString(),
  };
};

export const useOwambeRealtimeMock = () => {
  const [events, setEvents] = useState<SprayEvent[]>([]);
  const [demoMode, setDemoMode] = useState(true);
  const timerRef = useRef<number | null>(null);

  const pushEvent = useCallback((event: SprayEvent) => {
    setEvents((prev) => [...prev.slice(-30), event]);
  }, []);

  const spawnSpray = useCallback(() => {
    pushEvent(createSpray());
  }, [pushEvent]);

  useEffect(() => {
    if (!demoMode) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      const roll = Math.random();
      if (roll > 0.2) spawnSpray();
      if (roll > 0.8) spawnSpray();
    }, 900);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [demoMode, spawnSpray]);

  return { events, demoMode, setDemoMode, spawnSpray };
};
