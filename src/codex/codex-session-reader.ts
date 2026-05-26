import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { RiskEvent } from "../session/canonical-session";
import { classifyCommandPattern } from "../safety/command-risk";
import { classifyTextRisks } from "../safety/text-risk";

export interface CodexSessionMetadata {
  providerSessionId: string;
  path: string;
  mtimeMs: number;
}

export async function findLatestCodexSession(sinceMs = 0): Promise<CodexSessionMetadata | undefined> {
  const root = path.join(os.homedir(), ".codex", "sessions");
  const files: CodexSessionMetadata[] = [];
  await walk(root, files);
  return files
    .filter((file) => file.mtimeMs >= sinceMs)
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0];
}

export async function scanCodexSessionRisks(session: CodexSessionMetadata | undefined): Promise<RiskEvent[]> {
  if (!session) return [];
  const risks: RiskEvent[] = [];
  const seen = new Set<string>();

  await scanJsonlFile(session.path, (value) => {
    addCommandRisk(value, risks, seen);
    for (const finding of classifyTextRisks(value)) {
      addRisk(
        risks,
        seen,
        {
          level: finding.level,
          type: `codex-session-${finding.type}`,
          detail: finding.detail,
          recommendation: finding.recommendation,
        },
      );
    }
  });

  return risks;
}

async function walk(current: string, output: CodexSessionMetadata[]): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(current, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute, output);
      continue;
    }
    if (!entry.isFile() || !/\.(jsonl|json)$/i.test(entry.name)) continue;
    const stat = await fs.stat(absolute);
    output.push({
      providerSessionId: path.basename(entry.name).replace(/\.(jsonl|json)$/i, ""),
      path: absolute,
      mtimeMs: stat.mtimeMs,
    });
  }
}

async function scanJsonlFile(filePath: string, onText: (value: string) => void): Promise<void> {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    try {
      collectStrings(JSON.parse(line), onText);
    } catch {
      if (line.length < 20_000) onText(line);
    }
  }
}

function collectStrings(value: unknown, onText: (value: string) => void, depth = 0): void {
  if (depth > 8 || value === null || value === undefined) return;
  if (typeof value === "string") {
    if (value.length >= 6 && value.length <= 20_000) onText(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, onText, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (shouldSkipKey(key)) continue;
    collectStrings(item, onText, depth + 1);
  }
}

function shouldSkipKey(key: string): boolean {
  return /^(id|session_id|conversation_id|thread_id|created_at|timestamp|model|cwd|path)$/i.test(key);
}

function addCommandRisk(value: string, risks: RiskEvent[], seen: Set<string>): void {
  const commandRisk = classifyCommandPattern(value);
  if (commandRisk.level === "low") return;
  addRisk(risks, seen, {
    level: commandRisk.level,
    type: "codex-session-command-text",
    detail: commandRisk.reason || "Risky command pattern appeared in Codex session text",
    recommendation: "Review the referenced command. Do not execute it unless explicitly confirmed.",
  });
}

function addRisk(risks: RiskEvent[], seen: Set<string>, risk: RiskEvent): void {
  const key = `${risk.level}|${risk.type}|${risk.detail}`;
  if (seen.has(key)) return;
  seen.add(key);
  risks.push(risk);
}
