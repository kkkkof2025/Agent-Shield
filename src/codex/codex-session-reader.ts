import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

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

