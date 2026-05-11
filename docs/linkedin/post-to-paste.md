🚀 I shipped my first full-stack web app this week.

The catch? I lack working knowledge of TypeScript or JavaScript. 😅

I've been building AI agents for a long while now — LangChain, CrewAI, AutoGen. Frontend frameworks, schema migrations, and deploy pipelines were never my world. I wanted to test how far AI-assisted dev can help, so I took the idea and guidance from a tutorial and built it end to end.

The app — Strike — is a clean task manager. You create tasks, click a sparkle to have AI break each one into 3–6 actionable subtasks, drag-and-drop to reorder, soft-delete, and check off as you go. Email auth and per-user data isolation are wired in from the start.

The build loop:

🎨 Google Stitch generated the initial UI design from a prompt.

🛠️ Antigravity's manager-agent scaffolded a clean Next.js + Tailwind frontend that actually followed real code standards.

🔐 The Supabase MCP server stood up auth, row-level security, and the tables in fifteen minutes — easily the smoothest backend setup I've done.

⚡ When my Antigravity credits ran out, Claude Code took over and wrote the AI subtask feature using Groq's llama-3.3-70b-versatile inside a Supabase Edge Function, the drag-and-drop, and the soft-delete logic.

🎭 The Playwright MCP server handled all browser testing. I described each flow in plain English; the agent drove a real Chrome instance through every screen, signed in, clicked around, screenshotted, and reported back. No test scripts were written.

🚀 The Netlify MCP server + GitHub set up CI/CD. Every push to master deploys to production in about a minute.

Total lines of code I personally wrote: ZERO.

A few honest reflections of this:

💡 With a clear vision and a rough mental map of the architecture, these tools collapse weeks of work into hours.

🧩 But when something breaks — a JWT format error, a stale schema cache, a broken edge function — and you don't have the fundamentals to read the error, you feel surprisingly helpless.

AI-assisted dev is a force multiplier, not a replacement for understanding.

What's been the most impressive (or frustrating) part of AI-assisted development for you?

#AI #FullStack #ClaudeCode #Supabase #MCP #Netlify #BuildInPublic #Antigravity #Playwright
