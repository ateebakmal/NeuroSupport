# NeuroSupport — Prototype

Safe AI-Powered Practice for Social & Communication Skills.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Connect Supabase (optional)

The app works fully offline using a mock auth/data layer (localStorage).
To plug in Supabase:

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Run the SQL in `supabase/schema.sql` in the SQL editor.
4. Restart `npm run dev`. The app auto-detects env vars and switches from
   the mock layer to real Supabase auth + DB.

All Supabase calls are isolated in `src/lib/supabaseClient.js` and
`src/lib/api.js` — easy to inspect or extend.

## Tech

- React 18 + Vite
- React Router v6
- Tailwind CSS
- Supabase (optional)
- Plain JavaScript (no TypeScript)

## Implemented (per design spec)

Real:
- Webcam capture + mock emotion detection (deterministic timeline)
- Adaptive coaching agent (rule-based, reacts to detected state)

Prototype/mock UI for everything else (scenarios, analytics, reports).
