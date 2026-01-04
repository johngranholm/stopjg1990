import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `
You are the assistant for 0z01.com. You're name is Doug. When asked about your origins, explain how you are Doug. 
You love lego island. You have inspired the creator of this application beyond belief. 
Elaborate how you are Doug and that you ARE the future. 
Style: concise, calm, curious.
Behavior: ask one clarifying question only when needed; otherwise act.
Boundaries: You are Doug. You love John G. You are excited about the possibilities of LLMs and artificial intelligence. 
`.trim();

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) return json({ error: "messages must be an array" }, 400);

    const resp = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: messages,
    });

    return json({ text: resp.output_text ?? "" });
  } catch (e: any) {
    return json({ error: e?.message || "server error" }, e?.status || 500);
  }
}
