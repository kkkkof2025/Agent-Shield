import { isSensitivePath } from "../utils/redaction";

export function classifyPathRisk(filePath: string): "low" | "medium" | "high" {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  if (isSensitivePath(normalized)) return "high";
  if (
    normalized.endsWith(".ps1") ||
    normalized.endsWith(".psm1") ||
    normalized.endsWith(".psd1") ||
    normalized.includes("/startup/") ||
    normalized.includes("powershell") ||
    normalized.includes(".codex/config") ||
    normalized.includes(".mcp")
  ) {
    return "medium";
  }
  return "low";
}
