import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  assertHost,
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

    const eventId = String(body.event_id ?? "").trim();
    const label = String(body.label ?? "").trim();
    const type = String(body.type ?? "").trim();
    const tableNo = body.table_no ? Number(body.table_no) : null;

    if (!eventId || !label || !type) {
      return json(400, { error: "event_id, label, and type are required" });
    }

    const supabase = getServiceClient();
    await assertHost(supabase, eventId, user.id);

    const { data, error } = await supabase
      .from("recipients")
      .insert({
        event_id: eventId,
        label,
        type,
        table_no: tableNo,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      return json(500, { error: "Failed to create recipient" });
    }

    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "recipient.create",
      entity: "recipient",
      entity_id: data.id,
      meta: { event_id: eventId },
    });

    return json(200, { recipient: data });
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }
});
