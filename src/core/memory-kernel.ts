import path from "node:path";
import { readTextIfExists, writeText } from "../utils/fs-safe";

const MEMORY_FILES = ["AGENTS.md", "MEMORY.md", "TASKS.md", "DECISIONS.md", ".agent-shield/session-summary.md"];

export async function showMemory(workspace: string): Promise<string> {
  const chunks: string[] = [];
  for (const file of MEMORY_FILES) {
    const content = await readTextIfExists(path.join(workspace, file));
    chunks.push(`## ${file}\n${content || "未找到"}`);
  }
  return chunks.join("\n\n");
}

export async function updateWorkspaceSummary(workspace: string, content: string): Promise<void> {
  await writeText(path.join(workspace, ".agent-shield", "session-summary.md"), content);
}

