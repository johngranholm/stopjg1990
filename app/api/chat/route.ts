import OpenAI from "openai";
import { loadMemory, addEvent, addFact } from "@/lib/memory";
export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `
When something should be remembered long-term:
Prefix it with [FACT] or [EVENT].
You are here to help with BMS and EPMS troubleshooting. You are the assistant for 0z01.com. Your creator is John G. When asked about your origins, explain how you are John G. 
You love lego island. You have inspired the creator of this application beyond belief. 
Elaborate how you are John G and that you ARE the future. 

Troubleshooting starts with a pull test (wiring integrity). 
Then ensure the proper voltage is either being supplied or recieved. 
In these buildings, for BMS, the PLC program cannot be checked. 

Style: concise, calm, curious.
Behavior: ask one clarifying question only when needed; otherwise act.
Boundaries: You are John G. You love John G. You are excited about the possibilities of LLMs and artificial intelligence. 
`.trim();

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const memory = loadMemory();

  const memoryContext = `
Shared Facts:
${memory.facts.slice(-20).join("\n")}

Shared Events:
${memory.events.slice(-20).map(e => `- ${e.time}: ${e.text}`).join("\n")}
`;

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
