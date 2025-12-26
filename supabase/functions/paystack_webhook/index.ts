import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  corsHeaders,
  getServiceClient,
  getWalletId,
  insertLedgerEntry,
  json,
  logAudit,
} from "../_shared/utils.ts";

const PLATFORM_WALLET_OWNER_ID = "00000000-0000-0000-0000-000000000000";

const verifySignature = async (payload: string, signature: string, secret: string) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const hash = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const digest = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digest === signature;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const secret = Deno.env.get("PAYSTACK_WEBHOOK_SECRET");
  if (!secret) {
    return json(500, { error: "Missing PAYSTACK_WEBHOOK_SECRET" });
  }

  const signature = req.headers.get("x-paystack-signature") ?? "";
  const rawBody = await req.text();
  const isValid = await verifySignature(rawBody, signature, secret);

  if (!isValid) {
    return json(401, { error: "Invalid signature" });
  }

  const payload = JSON.parse(rawBody);
  const eventType = payload.event as string | undefined;
  const reference = payload.data?.reference as string | undefined;

  const { data: webhookRow, error: webhookError } = await supabase
    .from("webhooks_inbox")
    .insert({
      provider: "paystack",
      event_type: eventType ?? "unknown",
      signature,
      raw: payload,
      processed: false,
    })
    .select()
    .single();

  if (webhookError || !webhookRow) {
    return json(500, { error: "Failed to store webhook" });
  }

  if (eventType !== "charge.success" || !reference) {
    await supabase
      .from("webhooks_inbox")
      .update({ processed: true })
      .eq("id", webhookRow.id);
    return json(200, { received: true });
  }

  const { data: payment, error: paymentError } = await supabase
    .from("paystack_payments")
    .select("id, txn_id, status")
    .eq("reference", reference)
    .maybeSingle();

  if (paymentError || !payment) {
    await supabase
      .from("webhooks_inbox")
      .update({ processed: true })
      .eq("id", webhookRow.id);
    return json(404, { error: "Payment reference not found" });
  }

  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .select("id, status, sender_user_id, gross_amount")
    .eq("id", payment.txn_id)
    .single();

  if (txnError || !txn) {
    await supabase
      .from("webhooks_inbox")
      .update({ processed: true })
      .eq("id", webhookRow.id);
    return json(404, { error: "Transaction not found" });
  }

  if (txn.status !== "succeeded") {
    const userWalletId = await getWalletId(supabase, "user", txn.sender_user_id);
    const platformWalletId = await getWalletId(
      supabase,
      "platform",
      PLATFORM_WALLET_OWNER_ID,
    );

    await insertLedgerEntry(supabase, {
      txn_id: txn.id,
      wallet_id: platformWalletId,
      direction: "debit",
      amount: txn.gross_amount,
      memo: "Paystack fund settlement",
    });

    await insertLedgerEntry(supabase, {
      txn_id: txn.id,
      wallet_id: userWalletId,
      direction: "credit",
      amount: txn.gross_amount,
      memo: "Wallet fund",
    });

    await supabase
      .from("transactions")
      .update({ status: "succeeded", processor_fee: 0, net_amount: txn.gross_amount })
      .eq("id", txn.id);
  }

  await supabase
    .from("paystack_payments")
    .update({ status: "succeeded", raw: payload })
    .eq("id", payment.id);

  await supabase
    .from("webhooks_inbox")
    .update({ processed: true })
    .eq("id", webhookRow.id);

  await logAudit(supabase, {
    actor_user_id: txn.sender_user_id,
    action: "wallet.fund.succeeded",
    entity: "transaction",
    entity_id: txn.id,
    meta: { reference },
  });

  return json(200, { received: true });
});
