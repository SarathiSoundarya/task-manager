// Supabase Edge Function: generate-subtasks
// Generates a JSON array of subtasks for a given task title using Groq.
// Frontend contract:
//   Request:  { taskTitle: string, comments?: string, currentSubtasks?: string[] }
//   Response: { subtasks: string[] }  on 200
//             { error: string }       on 4xx/5xx

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = Deno.env.get("GROQ_MODEL") ?? "llama-3.3-70b-versatile";

function buildPrompt(
  taskTitle: string,
  comments?: string,
  currentSubtasks?: string[],
): string {
  const refining =
    Array.isArray(currentSubtasks) && currentSubtasks.length > 0;
  const sections: string[] = [];
  sections.push(`Main task: ${taskTitle}`);
  if (refining) {
    sections.push(
      `Existing subtasks (refine these):\n${
        currentSubtasks!.map((s, i) => `${i + 1}. ${s}`).join("\n")
      }`,
    );
  }
  if (comments && comments.trim()) {
    sections.push(`User feedback for refinement: ${comments.trim()}`);
  }
  sections.push(
    `Return between 3 and 6 concise, actionable subtasks. ` +
      `Each subtask must be a short imperative phrase (max ~10 words). ` +
      `Respond ONLY with strict JSON of the form {"subtasks":["...","..."]}. ` +
      `The "subtasks" value must be an array of plain strings (not objects). ` +
      `Do not include any prose, markdown, or code fences.`,
  );
  return sections.join("\n\n");
}

function extractJson(text: string): unknown {
  // Try direct parse first.
  try {
    return JSON.parse(text);
  } catch (_) {
    // Strip markdown code fences if present.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]);
      } catch (_) {
        // fall through
      }
    }
    // Last resort: grab the first {...} or [...] block.
    const obj = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (obj) {
      try {
        return JSON.parse(obj[0]);
      } catch (_) {
        // fall through
      }
    }
    throw new Error("Model did not return valid JSON");
  }
}

// Walk the parsed JSON and pull a string[] of subtasks out, regardless of
// which exact key the model used or whether items came back as objects.
function coerceSubtasks(parsed: unknown): string[] | null {
  const fromArray = (arr: unknown[]): string[] =>
    arr
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          for (const k of ["title", "text", "name", "subtask", "task", "value"]) {
            const v = obj[k];
            if (typeof v === "string") return v;
          }
        }
        return "";
      })
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  if (Array.isArray(parsed)) {
    const list = fromArray(parsed);
    return list.length > 0 ? list : null;
  }
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    // Check common keys the model might use.
    for (const k of ["subtasks", "tasks", "items", "list", "result", "data", "output"]) {
      const v = obj[k];
      if (Array.isArray(v)) {
        const list = fromArray(v);
        if (list.length > 0) return list;
      }
      // Sometimes nested: { data: { subtasks: [...] } }
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const inner = coerceSubtasks(v);
        if (inner) return inner;
      }
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return json(
      { error: "Server misconfigured: GROQ_API_KEY is not set" },
      500,
    );
  }

  let payload: { taskTitle?: string; comments?: string; currentSubtasks?: string[] };
  try {
    payload = await req.json();
  } catch (_) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const taskTitle = (payload?.taskTitle ?? "").toString().trim();
  if (!taskTitle) {
    return json({ error: "taskTitle is required" }, 400);
  }

  const prompt = buildPrompt(taskTitle, payload.comments, payload.currentSubtasks);

  let groqRes: Response;
  try {
    groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a productivity assistant that breaks tasks into small, actionable subtasks. " +
              "Always respond with strict JSON of the form {\"subtasks\":[\"...\",\"...\"]} " +
              "where each item is a plain string.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
  } catch (err) {
    console.error("Groq fetch failed:", err);
    return json(
      { error: `Failed to reach Groq: ${(err as Error).message}` },
      502,
    );
  }

  const rawText = await groqRes.text();
  if (!groqRes.ok) {
    console.error("Groq upstream error", groqRes.status, rawText.slice(0, 500));
    return json(
      {
        error: `Groq API error (${groqRes.status})`,
        upstream: rawText.slice(0, 500),
      },
      502,
    );
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (_) {
    console.error("Groq returned non-JSON:", rawText.slice(0, 500));
    return json({ error: "Groq returned non-JSON response" }, 502);
  }

  const content: unknown = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    console.error("Groq response missing content:", JSON.stringify(data).slice(0, 500));
    return json({ error: "Groq response missing message content" }, 502);
  }

  let parsed: unknown;
  try {
    parsed = extractJson(content);
  } catch (err) {
    console.error("Failed to extract JSON from content:", content.slice(0, 500));
    return json({ error: (err as Error).message, raw: content.slice(0, 500) }, 502);
  }

  const subtasks = coerceSubtasks(parsed);
  if (!subtasks || subtasks.length === 0) {
    console.error("Could not coerce subtasks from parsed JSON:", JSON.stringify(parsed).slice(0, 500));
    return json(
      {
        error: "Model did not return a non-empty subtasks array",
        raw: content.slice(0, 500),
      },
      502,
    );
  }

  return json({ subtasks }, 200);
});
