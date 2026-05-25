import { CanonicalSession } from "./canonical-session";

export function summarizeForHandoff(session: CanonicalSession): string {
  const changedFiles = session.fileChanges.map((change) => `${change.type}: ${change.file}`);
  return [
    `Session: ${session.id}`,
    `Provider: ${session.provider}`,
    `Workspace: ${session.workspace}`,
    `Status: ${session.status}`,
    `Summary: ${session.summary || "未记录"}`,
    "Changed files:",
    changedFiles.length ? changedFiles.map((line) => `- ${line}`).join("\n") : "- 未记录",
  ].join("\n");
}

