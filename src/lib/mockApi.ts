interface SprayPayload {
  recipient_id: string;
  amount_kobo: number;
  burst_count: number;
  vibe_pack: string;
  idempotency_key: string;
}

export const mockSprayApi = (payload: SprayPayload) => {
  const latency = 120 + Math.random() * 280;

  return new Promise<{ ok: boolean }>((resolve, reject) => {
    window.setTimeout(() => {
      if (Math.random() < 0.05) {
        reject(new Error('Network hiccup'));
        return;
      }
      resolve({ ok: true });
    }, latency);
  });
};
