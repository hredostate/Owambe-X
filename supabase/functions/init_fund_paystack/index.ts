import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  corsHeaders,
  getServiceClient,
  json,
  logAudit,
  requireAuth,
  validateAmount,
} from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const amount = Number(body.amount ?? 0);
    const idempotencyKey = String(body.idempotency_key ?? "").trim();

    if (!idempotencyKey) {
      return json(400, { error: "idempotency_key required" });
    }

    validateAmount(amount, 10000, 200000000);

    const supabase = getServiceClient();

    const { data: existingTxn } = await supabase
      .from("transactions")
      .select("id, status, meta")
      .eq("sender_user_id", user.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingTxn) {
      return json(200, { transaction_id: existingTxn.id, status: existingTxn.status });
    }

    const { data: txn, error: txnError } = await supabase
      .from("transactions")
      .insert({
        type: "fund",
        status: "pending",
        sender_user_id: user.id,
        gross_amount: amount,
        platform_fee: 0,
        processor_fee: 0,
        net_amount: amount,
        idempotency_key: idempotencyKey,
        meta: {},
      })
      .select()
      .single();

    if (txnError || !txn) {
      return json(500, { error: "Failed to create transaction" });
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET");
    if (!paystackSecret) {
      return json(500, { error: "Missing PAYSTACK_SECRET" });
    }

    const initResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        metadata: { user_id: user.id, txn_id: txn.id },
      }),
    });

    const initJson = await initResponse.json();
    if (!initResponse.ok) {
      return json(500, { error: initJson.message ?? "Paystack init failed" });
    }

    const reference = initJson.data?.reference as string | undefined;
    const authorizationUrl = initJson.data?.authorization_url as string | undefined;

    if (!reference || !authorizationUrl) {
      return json(500, { error: "Invalid Paystack response" });
    }

    const { error: paymentError } = await supabase
      .from("paystack_payments")
      .insert({
        txn_id: txn.id,
        reference,
        status: "initialized",
        raw: initJson,
      });

    if (paymentError) {
      return json(500, { error: "Failed to store payment reference" });
    }

    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "wallet.fund.init",
      entity: "transaction",
      entity_id: txn.id,
      meta: { reference },
    });

    return json(200, { authorization_url: authorizationUrl, reference });
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }
});
