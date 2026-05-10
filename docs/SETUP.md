# Setup Guide

Everything you need to take a freshly cloned repo and a freshly created Supabase project to a running app. Read top-to-bottom for first-time setup, or jump to a section.

- [Prerequisites](#prerequisites)
- [Fast path](#fast-path)
- [What `npm run setup` actually does](#what-npm-run-setup-actually-does)
- [What gets created in your Supabase project](#what-gets-created-in-your-supabase-project)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js 18+**
- **A Supabase project.** Create at [supabase.com/dashboard](https://supabase.com/dashboard) → "New project". Note the **Project ref** (the subdomain in your project URL: `<ref>.supabase.co`).
- **A Supabase personal access token.** Generate at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens). Starts with `sbp_`.
- **A Groq API key.** Generate at [console.groq.com/keys](https://console.groq.com/keys). Starts with `gsk_`.

You also need the project's **Project URL** and **anon (publishable) key** — find both at: Supabase Dashboard → your project → **Project Settings → API**.

---

## Fast path

```bash
git clone https://github.com/<you>/<repo>.git
cd <repo>

# Fill in CLI-side tokens (used by the setup script and Claude Code MCP, if you use it)
cp .env.example .env
# Edit .env: SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN, GROQ_API_KEY (NETLIFY_AUTH_TOKEN optional)

# Fill in browser-side env (used by the Next.js client at runtime)
cp taskflow_frontend/.env.example taskflow_frontend/.env.local
# Edit .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

cd taskflow_frontend
npm install
npm run setup       # links Supabase, applies migrations, sets the Groq secret, deploys the edge function
npm run dev         # http://localhost:3000
```

`npm run setup` is **idempotent** — re-run it any time to converge state.

---

## What `npm run setup` actually does

It's a Node script at `taskflow_frontend/scripts/setup.mjs`. Reading `.env` (project root) and `.env.local` (frontend), it spawns the Supabase CLI four times. If you want to do it by hand, or you're debugging a step, run these directly from `taskflow_frontend/` with `SUPABASE_ACCESS_TOKEN` set in your shell:

```bash
# 1. Link the CLI to your project (writes supabase/.temp/, gitignored).
npx supabase link --project-ref <your-project-ref>

# 2. Apply every SQL file in supabase/migrations/ in filename order.
#    --include-all replays migrations even if the CLI thinks they're applied,
#    which matters on Supabase projects where the schema was set up out-of-band.
npx supabase db push --include-all

# 3. Make GROQ_API_KEY available to the edge function at runtime.
npx supabase secrets set GROQ_API_KEY=<your-groq-key> --project-ref <your-project-ref>

# 4. Bundle and upload the generate-subtasks edge function.
npx supabase functions deploy generate-subtasks --project-ref <your-project-ref>
```

The script's exit code is the first failure's exit code. If step 2 fails on schema, fix the migration; if step 4 fails on Deno bundling, fix the function source — re-running the script just resumes from where it left off (each step is a no-op when it would do nothing).

---

## What gets created in your Supabase project

Two migration files in `taskflow_frontend/supabase/migrations/`. Read them for exact SQL — this section is the reference summary.

### `public.users` — application profile, 1:1 with `auth.users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `timezone` | `text` | default `'UTC'` |
| `updated_at` | `timestamptz` | default `now()`, kept fresh by `update_profiles_updated_at` trigger |

**RLS:** enabled. Policies:
- *Users can view their own profile* — `SELECT` where `auth.uid() = id`
- *Users can update their own profile* — `UPDATE` where `auth.uid() = id`

**Auto-population:** trigger `on_auth_user_created` on `auth.users` calls `handle_new_user()` after each new auth signup, inserting `(new.id)` into `public.users`. So the row exists by the time the user lands on the app.

### `public.tasks`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE |
| `title` | `text` | not null |
| `priority` | `text` | default `'medium'`, CHECK in `('low', 'medium', 'high')` |
| `status` | `text` | default `'pending'`, CHECK in `('pending', 'in-progress', 'done')` |
| `is_deleted` | `boolean` | default `false` — soft-delete flag |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, auto-updated by trigger |

**RLS:** enabled. Policy:
- *Users can manage their own tasks* — `ALL` where `auth.uid() = user_id`

### `public.subtasks`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `task_id` | `uuid` | not null, FK → `public.tasks(id)` ON DELETE CASCADE |
| `title` | `text` | not null |
| `is_completed` | `boolean` | default `false` |
| `is_deleted` | `boolean` | not null, default `false` — soft-delete flag |
| `position` | `integer` | not null — explicit ordering within a task |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, auto-updated by trigger |

**Index:** `subtasks_task_position_idx` on `(task_id, position)` — keeps the ordered list query cheap.

**RLS:** enabled. Policy:
- *Users can manage subtasks of their own tasks* — `ALL` using

  ```sql
  exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id
      and tasks.user_id = auth.uid()
  )
  ```

  i.e., a subtask is yours iff the parent task is yours.

### Helper function and triggers

- `public.update_updated_at_column()` — `trigger` function, sets `new.updated_at = now()`. Fires on every `UPDATE` on `users`, `tasks`, and `subtasks`.
- `public.handle_new_user()` — `trigger` function (security definer), inserts the freshly created `auth.users.id` into `public.users`. Fires from the `on_auth_user_created` trigger on `auth.users` after insert.

### Edge function: `generate-subtasks`

- **Source:** `taskflow_frontend/supabase/functions/generate-subtasks/index.ts` (Deno).
- **Config:** `taskflow_frontend/supabase/config.toml` sets `[functions.generate-subtasks] verify_jwt = true`. The Supabase gateway rejects calls that don't carry a valid Supabase Auth JWT — i.e., the user must be signed in. `supabase-js` attaches the session token automatically when calling `supabase.functions.invoke('generate-subtasks', ...)`.
- **Required secret:** `GROQ_API_KEY` (set by step 3 of the setup script). The function returns `500 "Server misconfigured: GROQ_API_KEY is not set"` if it's missing.
- **Request shape:**
  ```ts
  { taskTitle: string, comments?: string, currentSubtasks?: string[] }
  ```
- **Response shape:**
  ```ts
  { subtasks: string[] }                // 200
  { error: string, ...optionalContext }  // 4xx / 5xx
  ```
- **Behavior:** Builds a system + user prompt, hits Groq's OpenAI-compatible chat completions endpoint with `response_format: { type: 'json_object' }`, validates and coerces the response to a string array, and returns it. Robust to common model quirks: handles markdown code fences, nested keys (`subtasks` / `tasks` / `items` / `data`), and object-typed items (extracts a string field).
- **Default model:** `llama-3.3-70b-versatile`. Override with the `GROQ_MODEL` env var on the function (set via `supabase secrets set GROQ_MODEL=...` if needed).

---

## Troubleshooting

### `Error: Server misconfigured: GROQ_API_KEY is not set` from the AI button
The function is reachable but its environment doesn't have the secret. Re-run step 3 of the setup, or:
```bash
npx supabase secrets set GROQ_API_KEY=<your-groq-key> --project-ref <ref>
npx supabase secrets list --project-ref <ref>   # confirm
```

### `401 UNAUTHORIZED_INVALID_JWT_FORMAT` calling the edge function
The caller sent a non-JWT in the Authorization header. With Supabase's new publishable key format (`sb_publishable_…`, *not* a JWT), this happens when the user isn't signed in — `supabase-js` falls back to the publishable key as the bearer token, and the gateway rejects it. Sign in first; `supabase-js` will then attach the user's session JWT and the gateway will accept it.

### `400 Bad Request` from PostgREST after a migration ("column does not exist")
PostgREST's schema cache is stale. Trigger a reload:
```bash
npx supabase db query --linked --agent=no "notify pgrst, 'reload schema';"
```
Or wait ~30 seconds for the cache to roll over on its own.

### `db push` says "No new migrations" but I just changed a migration
The CLI tracks applied migrations in `supabase_migrations.schema_migrations` by their timestamp prefix. Don't edit a migration that's already been applied — write a new one. To replay everything (use sparingly, fine on a fresh project):
```bash
npx supabase db push --include-all
```

### `supabase link` says "Cannot find project ref"
You haven't linked yet. Either run `npx supabase link --project-ref <ref>` once, or pass `--project-ref <ref>` to whichever command you're running.

### `supabase login` fails with "Cannot use automatic login flow inside non-TTY environments"
You're running it through a wrapper (e.g. an MCP shell). Open a real terminal window and run `npx supabase login` there, or set `SUPABASE_ACCESS_TOKEN=<your-token>` directly in your shell — the CLI accepts that as an alternative to interactive login.

### Migrations were applied via the dashboard SQL editor, but `db push` keeps trying to re-apply them
That's expected — the dashboard SQL editor doesn't write to `supabase_migrations.schema_migrations`. The migrations in this repo are written to be **idempotent** (`if not exists`, `drop policy ... create policy`, `on conflict do nothing`), so the re-application is a safe no-op. If you want the CLI's tracker to match reality, you can mark them applied without re-running:
```bash
npx supabase migration repair --status applied <timestamp>
```

### My local `.env` has the right values but `npm run setup` still says "Missing values"
The script reads the `.env` at the **repo root**, not inside `taskflow_frontend/`. Confirm the file is at the same level as the README.

---

## What this guide does not cover

- **Provisioning a Supabase project itself.** Done in the dashboard; it's a one-click step but it's outside what the CLI can automate from a clean clone.
- **Hosting the Next.js app.** The frontend is just a Next.js 14 app; deploy it to Netlify, Vercel, Cloudflare Pages, etc. with the same two `NEXT_PUBLIC_*` env vars set on the host. The Supabase side (DB, function) doesn't change between local dev and production.
