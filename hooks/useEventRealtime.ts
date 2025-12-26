import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SprayCreatedPayload } from '../types';

export const useEventRealtime = (
  eventId: string | undefined,
  onSprayCreated: (payload: SprayCreatedPayload) => void,
) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const channel = supabase.channel(`event:${eventId}`);

    channel
      .on('broadcast', { event: 'spray.created' }, ({ payload }) => {
        onSprayCreated(payload as SprayCreatedPayload);
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
      setConnected(false);
    };
  }, [eventId, onSprayCreated]);

  return { connected };
};
