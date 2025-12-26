import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  corsHeaders,
  getServiceClient,
  getWalletId,
  insertLedgerEntry,
  json,
  logAudit,
  requireAuth,
  validateAmount,
} from "../_shared/utils.ts";

const DAILY_WITHDRAWAL_CAP = 2000000;
const PLATFORM_WALLET_OWNER_ID = "00000000-0000-0000-0000-000000000000";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const amount = Number(body.amount ?? 0);
    const bankCode = String(body.bank_code ?? "").trim();
    const accountNumber = String(body.account_number ?? "").trim();

    if (!bankCode || !accountNumber) {
      return json(400, { error: "bank_code and account_number required" });
    }

    validateAmount(amount, 10000, DAILY_WITHDRAWAL_CAP);

    const supabase = getServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone_verified")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.phone_verified) {
      return json(403, { error: "Phone verification required" });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: withdrawals, error: withdrawalError } = await supabase
      .from("transactions")
      .select("gross_amount")
      .eq("sender_user_id", user.id)
      .eq("type", "withdraw")
      .gte("created_at", since)
      .in("status", ["pending", "succeeded"]);

    if (withdrawalError) {
      return json(500, { error: "Failed to check withdrawal limits" });
    }

    const used = withdrawals?.reduce((sum, row) => sum + (row.gross_amount ?? 0), 0) ?? 0;
    if (used + amount > DAILY_WITHDRAWAL_CAP) {
      return json(400, { error: "Daily withdrawal cap exceeded" });
    }

    const { data: txn, error: txnError } = await supabase
      .from("transactions")
      .insert({
        type: "withdraw",
        status: "pending",
        sender_user_id: user.id,
        gross_amount: amount,
        platform_fee: 0,
        processor_fee: 0,
        net_amount: amount,
        meta: { bank_code: bankCode, account_number: accountNumber },
      })
      .select()
      .single();

    if (txnError || !txn) {
      return json(500, { error: "Failed to create withdrawal" });
    }

    const userWalletId = await getWalletId(supabase, "user", user.id);
    const platformWalletId = await getWalletId(
      supabase,
      "platform",
      PLATFORM_WALLET_OWNER_ID,
    );

    await insertLedgerEntry(supabase, {
      txn_id: txn.id,
      wallet_id: userWalletId,
      direction: "debit",
      amount,
      memo: "Withdrawal queued",
    });

    await insertLedgerEntry(supabase, {
      txn_id: txn.id,
      wallet_id: platformWalletId,
      direction: "credit",
      amount,
      memo: "Withdrawal hold",
    });

    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "withdraw.request",
      entity: "transaction",
      entity_id: txn.id,
      meta: { amount, bank_code: bankCode },
    });

    return json(200, { status: "queued", transaction_id: txn.id });
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }
});
