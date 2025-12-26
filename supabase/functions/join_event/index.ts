import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  corsHeaders,
  getServiceClient,
  json,
  logAudit,
  requireAuth,
} from "../_shared/utils.ts";

const signScreenToken = async (payload: Record<string, unknown>) => {
  const secret = Deno.env.get("SCREEN_MODE_SECRET") ?? "screen-mode";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const body = btoa(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${body}.${signatureBase64}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const eventId = String(body.event_id ?? "").trim();

    if (!eventId) {
      return json(400, { error: "event_id is required" });
    }

    const supabase = getServiceClient();

    const { error: memberError } = await supabase.from("event_members").upsert(
      {
        event_id: eventId,
        user_id: user.id,
        role: "guest",
      },
      { onConflict: "event_id,user_id" },
    );

    if (memberError) {
      return json(500, { error: "Failed to join event" });
    }

    const screenToken = await signScreenToken({
      sub: user.id,
      event_id: eventId,
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    });

    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "event.join",
      entity: "event",
      entity_id: eventId,
    });

    return json(200, {
      channel: `event:${eventId}`,
      screen_token: screenToken,
    });
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }
});
