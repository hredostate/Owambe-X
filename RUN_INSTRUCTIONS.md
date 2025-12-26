# Owambe Mode Run Instructions

## Environment Variables
Set these variables before running the frontend or Edge Functions:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYSTACK_SECRET=your-paystack-secret
PAYSTACK_WEBHOOK_SECRET=your-paystack-webhook-secret
SCREEN_MODE_SECRET=screen-mode-jwt-secret
```

## Database Setup
1. Apply `schema.sql` in your Supabase SQL editor.
2. Ensure RLS is enabled and policies are created.
3. Confirm the platform wallet seed row exists.

## Edge Functions
From the repo root:

```bash
supabase functions deploy create_event
supabase functions deploy join_event
supabase functions deploy add_recipient
supabase functions deploy spray
supabase functions deploy init_fund_paystack
supabase functions deploy paystack_webhook
supabase functions deploy withdraw
```

## Frontend
```bash
npm install
npm run dev
```

The app is routed under `/owambe` with the screen mode at `/owambe/screen/:id`.
