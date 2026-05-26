import { isSensitivePath } from "../utils/redaction";

export function classifyPathRisk(filePath: string): "low" | "medium" | "high" {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  if (isSensitivePath(normalized)) return "high";
  if (
    normalized.endsWith("/agents.md") ||
    normalized === "agents.md" ||
    normalized.endsWith("/memory.md") ||
    normalized === "memory.md" ||
    normalized.endsWith("/tasks.md") ||
    normalized === "tasks.md" ||
    normalized.endsWith("/decisions.md") ||
    normalized === "decisions.md" ||
    normalized.includes(".codex/") ||
    normalized.includes(".claude/") ||
    normalized.includes(".openclaw/") ||
    normalized.includes("/mcp.") ||
    normalized.includes("/mcp/")
  ) {
    return "high";
  }
  if (
    normalized.endsWith(".ps1") ||
    normalized.endsWith(".psm1") ||
    normalized.endsWith(".psd1") ||
    normalized.includes("/startup/") ||
    normalized.includes("powershell") ||
    normalized.endsWith("package.json")
  ) {
    return "medium";
  }
  return "low";
}
