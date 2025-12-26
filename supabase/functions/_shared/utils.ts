import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

export const getServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role env vars");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

export const getAuthedClient = (token: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase anon env vars");
  }

  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: token } },
  });
};

export const requireAuth = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const supabase = getAuthedClient(authHeader);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }

  return data.user;
};

export const validateAmount = (amount: number, min: number, max: number) => {
  if (!Number.isInteger(amount)) {
    throw new Error("Amount must be an integer in kobo");
  }
  if (amount < min || amount > max) {
    throw new Error(`Amount must be between ${min} and ${max} kobo`);
  }
};

export const validateEventMember = async (
  supabase: SupabaseClient,
  eventId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("event_members")
    .select("id, role")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("User is not a member of this event");
  }

  return data;
};

export const assertHost = async (
  supabase: SupabaseClient,
  eventId: string,
  userId: string,
) => {
  const member = await validateEventMember(supabase, eventId, userId);
  if (member.role !== "host") {
    throw new Error("Host role required");
  }
};

export const rateLimit = async (
  supabase: SupabaseClient,
  eventId: string,
  userId: string,
  windowSeconds: number,
  maxRequests: number,
) => {
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000,
  );

  const { data: existing, error: existingError } = await supabase
    .from("spray_rate_limits")
    .select("id, request_count")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  if (existingError) {
    throw new Error("Rate limit lookup failed");
  }

  if (!existing) {
    const { error } = await supabase.from("spray_rate_limits").insert({
      event_id: eventId,
      user_id: userId,
      window_start: windowStart.toISOString(),
      request_count: 1,
    });

    if (error) {
      throw new Error("Rate limit write failed");
    }

    return;
  }

  const nextCount = existing.request_count + 1;
  if (nextCount > maxRequests) {
    throw new Error("Rate limit exceeded");
  }

  const { error } = await supabase
    .from("spray_rate_limits")
    .update({ request_count: nextCount })
    .eq("id", existing.id);

  if (error) {
    throw new Error("Rate limit update failed");
  }
};

export const logAudit = async (
  supabase: SupabaseClient,
  payload: {
    actor_user_id?: string | null;
    action: string;
    entity: string;
    entity_id?: string | null;
    ip?: string | null;
    user_agent?: string | null;
    meta?: Record<string, unknown>;
  },
) => {
  const { error } = await supabase.from("audit_logs").insert({
    ...payload,
    meta: payload.meta ?? {},
  });

  if (error) {
    throw new Error("Audit log insert failed");
  }
};

export const getWalletId = async (
  supabase: SupabaseClient,
  ownerType: "user" | "event" | "platform",
  ownerId: string,
) => {
  const { data, error } = await supabase
    .from("wallets")
    .select("id")
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Wallet not found");
  }

  return data.id as string;
};

export const insertLedgerEntry = async (
  supabase: SupabaseClient,
  entry: {
    txn_id: string;
    wallet_id: string;
    direction: "debit" | "credit";
    amount: number;
    memo?: string;
  },
) => {
  const { error } = await supabase.from("ledger_entries").insert(entry);
  if (error) {
    throw new Error("Ledger insert failed");
  }
};
