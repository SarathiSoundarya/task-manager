# Strike

A small task manager I built this week to try out **Antigravity, Supabase,
Claude Code,** and the **Playwright MCP plugin** end-to-end.

## What it does

- Sign up / sign in (email + password, via Supabase Auth)
- Create tasks with priority + status
- Expand any task → add subtasks manually, **drag-and-drop to reorder**, soft-delete
- One click on the ✨ icon → AI generates 3–6 actionable subtasks via **Groq**
  (`llama-3.3-70b-versatile`) running inside a Supabase Edge Function
- Pick `Accept All` or `Accept Selected` to keep only the suggestions you want

## Stack

| Layer | Tool |
|---|---|
| UI design | Google Stitch (initial mockup) |
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Reorder | `@dnd-kit/core` |
| Backend | Supabase (Postgres + RLS + Auth + Edge Functions) |
| AI | Groq · `llama-3.3-70b-versatile` |
| Hosting | Netlify (auto-deploys on `git push` to `master`) |
| Built with | Antigravity → Claude Code |
| Tested with | Playwright MCP (fully autonomous) |

## Why I built it

I work on AI agents (LangChain / CrewAI / AutoGen) and wanted to test how far
end-to-end "vibe coding" with modern AI tools has actually come. The project
idea came from a tutorial — what I cared about was the *experience* of
shipping something real with these tools without writing a line of TypeScript
myself.

## What surprised me

- **Supabase MCP** turned "wire up auth + tables + RLS" into a 5-minute
  prompted task.
- **Playwright MCP** drove a real Chrome instance through every flow with no
  scripts — I just gave it a checklist.
- The honest catch: the tools are *amazing* when you have a clear vision and
  rough technical fundamentals, and noticeably less amazing when something
  breaks and you don't.

## Repo

https://github.com/SarathiSoundarya/task-manager
