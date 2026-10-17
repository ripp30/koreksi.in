# Koreksi.in — Real Integration MVP

Frontend Next.js + Supabase Auth/Database/Storage + n8n trigger + Gemini PDF evaluation.

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `N8N_CALLBACK_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

## 3. Supabase

Run `supabase-schema.sql` in Supabase SQL Editor. The current app uses table name `submissions` (not `submisiion`). Create/keep a private Storage bucket named `submissions`.

Enable Google OAuth in Supabase Authentication > Providers > Google. Add your local callback URL:

`http://localhost:3000/auth/callback`

For production, use the production callback URL too.

## 4. n8n

Import `n8n-workflows/submission-pipeline.json`.

Set n8n environment variables:

- `KOREKSI_PROCESS_URL=https://YOUR_PUBLIC_KOREKSI_HOST/api/n8n/process`
- `KOREKSI_CALLBACK_SECRET` = same value as Next.js `N8N_CALLBACK_SECRET`

Set the workflow active and copy its production webhook URL into `N8N_WEBHOOK_URL`.

If Next.js and n8n are both local, `N8N_WEBHOOK_URL` can point to the local n8n URL, but n8n must be able to reach the Next.js `/api/n8n/process` endpoint. For n8n Cloud, Next.js must be reachable over HTTPS (localhost is not reachable from n8n Cloud).

## 5. Gemini

The processing endpoint sends the uploaded PDF to Gemini and requests JSON containing suggested score, feedback, similarity score, AI risk and extracted text.

## 6. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Real flow

Google login → Dashboard → Create Room → Supabase `rooms` + `rubrics` → Student Room Code → PDF upload to private Supabase Storage → `submissions` row → n8n webhook → `/api/n8n/process` → Gemini → `evaluations` + update `submissions` → Lecturer Review → Override/Approve → `final_grades` → XLSX export.
