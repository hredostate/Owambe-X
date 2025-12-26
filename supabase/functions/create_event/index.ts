import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  corsHeaders,
  getServiceClient,
  json,
  logAudit,
  requireAuth,
} from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const venue = body.venue ? String(body.venue).trim() : null;
    const startsAt = body.starts_at ? String(body.starts_at) : null;
    const endsAt = body.ends_at ? String(body.ends_at) : null;
    const payoutMode = body.payout_mode === "hold" ? "hold" : "instant";
    const theme = body.theme ? String(body.theme).trim() : null;

    if (!title) {
      return json(400, { error: "Title is required" });
    }

    const supabase = getServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        created_by: user.id,
        title,
        venue,
        starts_at: startsAt,
        ends_at: endsAt,
        payout_mode: payoutMode,
        theme,
        status: "draft",
      })
      .select()
      .single();

    if (eventError || !event) {
      return json(500, { error: "Failed to create event" });
    }

    const { error: memberError } = await supabase.from("event_members").insert({
      event_id: event.id,
      user_id: user.id,
      role: "host",
    });

    if (memberError) {
      return json(500, { error: "Failed to add host membership" });
    }

    const { error: walletError } = await supabase.from("wallets").insert({
      owner_type: "event",
      owner_id: event.id,
    });

    if (walletError) {
      return json(500, { error: "Failed to create event wallet" });
    }

    const { error: recipientError } = await supabase.from("recipients").insert({
      event_id: event.id,
      label: "Celebrant",
      type: "celebrant",
      is_active: true,
    });

    if (recipientError) {
      return json(500, { error: "Failed to create default recipient" });
    }

    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "event.create",
      entity: "event",
      entity_id: event.id,
      meta: { title },
    });

    return json(200, { event });
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }
});
