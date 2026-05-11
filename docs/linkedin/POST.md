# LinkedIn post — final, corrected for LinkedIn rendering

LinkedIn's composer treats markdown (`**bold**`, `*italics*`, `` `code` ``) as
literal characters. The block below is plain text — paste it directly into the
post composer.

Carousel images live in this same folder, numbered 01–05 in order.

---

🚀 This week I shipped my first full-stack web app.

The catch?
I don't know a single line of TypeScript or JavaScript. 😅

For the last few years, I've been building AI agents with LangChain, CrewAI, and AutoGen. Frontend code, schema migrations, deploy pipelines — none of that has been my world.

But I kept reading about how far AI-assisted development had come, so I picked up an idea from a tutorial I'd watched and decided to try building it solo.

The result: Strike — a calm, focused task manager with AI-generated subtasks.

Here's what the journey looked like 👇

🎨 I started in Google Stitch, where a prompt generated the initial UI design.

I took the HTML output and handed it to Antigravity's manager-agent view, which scaffolded a clean Next.js + Tailwind frontend that actually followed proper code standards.

🗄️ Next came auth + database setup.

Using the Supabase MCP server, I stood up:
• Email/password signup
• Email verification
• users, tasks, and subtasks tables

…in maybe 20 minutes of prompting.
The easiest backend setup I've ever wired up.

⚡ Then my Antigravity credits ran out.

So I switched to Claude Code and kept building:
• AI-generated subtasks using Groq's llama-3.3-70b-versatile inside a Supabase Edge Function
• Drag-and-drop reordering
• Soft-delete on subtasks (row-level, restorable)
• Full end-to-end app flow

Finally, I asked Claude to:
✅ Push everything to GitHub
✅ Set up CI/CD on Netlify
✅ Auto-deploy on every git push

Total lines of TypeScript I personally wrote:
ZERO.

A few honest reflections after a week of this:

💡 These tools are extraordinary when you have:
• A clear vision
• A rough mental map of the architecture
• The ability to reason about systems

They can compress weeks of work into hours.

But…

🧩 When something breaks — a JWT format issue, a stale schema cache, a broken edge function — and you don't understand the fundamentals, you feel surprisingly helpless.

I had moments where prompting alone wasn't enough.
Understanding what was actually happening became non-negotiable.

So I think both things are true at the same time:

⚖️ AI-assisted development is an incredible force multiplier.
⚖️ It still requires strong fundamentals and careful code review to use safely.

Not a replacement for understanding — an amplifier for it.

And the one tool that genuinely felt like science fiction to me? 🤯

The Playwright MCP server.

You hand it a checklist, it:
🌐 Opens a real browser
🔐 Signs in
🖱️ Clicks around
📸 Takes screenshots
📝 Reports back

No scripts. No manual testing.
I'm still not over it.

Curious how others are experiencing this shift too — especially people building with AI coding agents daily.

What's been the most impressive (or frustrating) part for you so far?

#AI #FullStackDevelopment #GenerativeAI #ClaudeCode #Supabase #NextJS #LangChain #AIEngineering #WebDevelopment #MCP #Automation

---

## Quick checklist before you post

- Drop your repo URL in the FIRST COMMENT, not the body — LinkedIn's algorithm down-ranks outbound links in the post body.
- Upload all five images (`01-landing.jpg`, `02-tasks.jpg`, `03-ai-subtasks.jpg`, `04-filtering.jpg`, `05-auth.jpg`) as a multi-image carousel in the listed order.
- Best windows for tech content: Tuesday–Thursday, 8–10am or 12–1pm in your timezone.
- Reply to the first 2–3 comments fast — early engagement teaches the algorithm to distribute the post.
- If anyone pushes back on "I don't know a single line of TS/JS" — engage politely. Your truthful answer: you brought programming fundamentals to the table; you just didn't know the language. That conversation is fertile ground for further engagement, not something to deflect.

## Optional 20-second demo (Windows)

Press `Win + G` (Xbox Game Bar, built into Windows 11) → click record. Drive the app through this flow:

1. Home page (3s)
2. Sign in (3s)
3. Type a task + Enter (3s)
4. Click the AI sparkle → Generate Subtasks (~5s)
5. Pick 3 of the 5 → Accept Selected (3s)
6. Drag a subtask to a new position (2s)
7. Final shot of the populated list (1s)

Saves an MP4 to `Videos/Captures/`. No narration needed — visuals carry it.
