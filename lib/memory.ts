import fs from "fs";

const FILE = "memory.json";

export function loadMemory() {
  if (!fs.existsSync(FILE)) return { facts: [], events: [] };
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

export function saveMemory(mem: any) {
  fs.writeFileSync(FILE, JSON.stringify(mem, null, 2));
}

export function addEvent(text: string) {
  const mem = loadMemory();
  mem.events.push({ time: new Date().toISOString(), text });
  saveMemory(mem);
}

export function addFact(text: string) {
  const mem = loadMemory();
  mem.facts.push(text);
  saveMemory(mem);
}
