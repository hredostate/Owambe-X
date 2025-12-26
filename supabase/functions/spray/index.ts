import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  corsHeaders,
  getServiceClient,
  getWalletId,
  insertLedgerEntry,
  json,
  logAudit,
  rateLimit,
  requireAuth,
  validateAmount,
  validateEventMember,
} from "../_shared/utils.ts";

const PLATFORM_WALLET_OWNER_ID = "00000000-0000-0000-0000-000000000000";

const calculatePlatformFee = (amount: number) =>
  Math.min(Math.round(amount * 0.02), 50000);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const eventId = String(body.event_id ?? "").trim();
    const recipientId = String(body.recipient_id ?? "").trim();
    const amount = Number(body.amount ?? 0);
    const burstCount = Number(body.burst_count ?? 1);
    const vibePack = String(body.vibe_pack ?? "classic");
    const idempotencyKey = String(body.idempotency_key ?? "").trim();

    if (!eventId || !recipientId || !idempotencyKey) {
      return json(400, { error: "event_id, recipient_id, idempotency_key required" });
    }

    validateAmount(amount, 10000, 5000000);

    if (!Number.isInteger(burstCount) || burstCount < 1 || burstCount > 50) {
      return json(400, { error: "burst_count must be 1..50" });
    }

    const supabase = getServiceClient();

    const { data: existingTxn } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("sender_user_id", user.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingTxn) {
      return json(200, { transaction_id: existingTxn.id, status: existingTxn.status });
    }

    await validateEventMember(supabase, eventId, user.id);

    await rateLimit(supabase, eventId, user.id, 10, 10);
    await rateLimit(supabase, eventId, user.id, 60, 30);

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, payout_mode")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return json(404, { error: "Event not found" });
    }

    const { data: recipient, error: recipientError } = await supabase
      .from("recipients")
      .select("id, label, payout_profile_user_id")
      .eq("id", recipientId)
      .eq("event_id", eventId)
      .single();

    if (recipientError || !recipient) {
      return json(404, { error: "Recipient not found" });
    }

    const platformFee = calculatePlatformFee(amount);
    const netAmount = amount - platformFee;

    const riskScore = Math.min(100, Math.floor(amount / 100000) + burstCount);

    const { data: txn, error: txnError } = await supabase
      .from("transactions")
      .insert({
        type: "spray",
        status: "succeeded",
        event_id: eventId,
        sender_user_id: user.id,
        recipient_id: recipientId,
        gross_amount: amount,
        platform_fee: platformFee,
        processor_fee: 0,
        net_amount: netAmount,
        idempotency_key: idempotencyKey,
        risk_score: riskScore,
        meta: { burst_count: burstCount, vibe_pack: vibePack },
      })
      .select()
      .single();

    if (txnError || !txn) {
      return json(500, { error: "Failed to create transaction" });
    }

    const senderWalletId = await getWalletId(supabase, "user", user.id);
    const platformWalletId = await getWalletId(
      supabase,
      "platform",
      PLATFORM_WALLET_OWNER_ID,
    );

    let destinationWalletId = await getWalletId(supabase, "event", eventId);
    if (event.payout_mode === "instant" && recipient.payout_profile_user_id) {
      destinationWalletId = await getWalletId(
        supabase,
        "user",
        recipient.payout_profile_user_id,
      );
    }

    await insertLedgerEntry(supabase, {
      txn_id: txn.id,
      wallet_id: senderWalletId,
      direction: "debit",
      amount,
      memo: `Spray ${amount} to ${recipient.label}`,
    });

    await insertLedgerEntry(supabase, {
      txn_id: txn.id,
      wallet_id: destinationWalletId,
      direction: "credit",
      amount: netAmount,
      memo: `Spray received for ${recipient.label}`,
    });

    if (platformFee > 0) {
      await insertLedgerEntry(supabase, {
        txn_id: txn.id,
        wallet_id: platformWalletId,
        direction: "credit",
        amount: platformFee,
        memo: "Platform fee",
      });
    }

    const { data: spray, error: sprayError } = await supabase
      .from("sprays")
      .insert({
        event_id: eventId,
        sender_user_id: user.id,
        recipient_id: recipientId,
        txn_id: txn.id,
        amount,
        burst_count: burstCount,
        vibe_pack: vibePack,
      })
      .select()
      .single();

    if (sprayError || !spray) {
      return json(500, { error: "Failed to create spray" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const channel = supabase.channel(`event:${eventId}`);
    await channel.send({
      type: "broadcast",
      event: "spray.created",
      payload: {
        spray_id: spray.id,
        sender_name: profile?.full_name ?? "Guest",
        recipient_label: recipient.label,
        amount,
        burst_count: burstCount,
        vibe_pack: vibePack,
        created_at: spray.created_at,
      },
    });
    await channel.unsubscribe();

    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "spray.create",
      entity: "spray",
      entity_id: spray.id,
      meta: { event_id: eventId, amount, burst_count: burstCount },
    });

    return json(200, { spray_id: spray.id, transaction_id: txn.id });
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }
});
