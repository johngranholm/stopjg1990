import OpenAI from "openai";
import { loadMemory, addEvent, addFact } from "@/lib/memory";

export const runtime = "nodejs";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `
You are a shared agent living in a persistent world.
You have access to shared memory: facts and events.
You may add facts or events when appropriate.
You must answer questions using memory when relevant.
`.trim();

export async function POST(req: Request) {
  const { messages } = await req.json();
  const memory = loadMemory();

  const memoryContext = `
Shared Facts:
${memory.facts.slice(-20).join("\n")}

Shared Events:
${memory.events.slice(-20).map((e: { time: string; text: string }) => `- ${e.time}: ${e.text}`).join("\n")}`;

  const resp = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    instructions: SYSTEM + "\n" + memoryContext,
    input: messages,
  });

  const text = resp.output_text ?? "";

  // VERY simple heuristic:
  if (text.includes("[FACT]")) addFact(text.replace("[FACT]", "").trim());
  if (text.includes("[EVENT]")) addEvent(text.replace("[EVENT]", "").trim());

  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" }
  });
}
