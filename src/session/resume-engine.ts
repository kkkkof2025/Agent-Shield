import path from "node:path";
import { CanonicalSession } from "./canonical-session";
import { getLastSession, getSession } from "./session-registry";
import { RecoveryContext } from "../memory/recovery-context";
import { readTextIfExists } from "../utils/fs-safe";

export async function resolveSessionForResume(id?: string): Promise<CanonicalSession> {
  const session = id ? await getSession(id) : await getLastSession();
  if (!session) throw new Error(id ? `Session not found: ${id}` : "No AgentShield session found.");
  return session;
}

export async function buildRecoveryContext(session: CanonicalSession): Promise<RecoveryContext> {
  const workspace = session.workspace;
  const summary = await readTextIfExists(path.join(workspace, ".agent-shield", "session-summary.md"));
  const tasks = await readTextIfExists(path.join(workspace, "TASKS.md"));
  const memory = await readTextIfExists(path.join(workspace, "MEMORY.md"));
  const decisionsFile = await readTextIfExists(path.join(workspace, "DECISIONS.md"));
  return {
    originalGoal: session.goal || "未记录",
    currentState: firstPresent(summary, tasks, session.summary, "未记录"),
    completed: [session.summary || "最近一次会话已记录。"],
    changedFiles: session.fileChanges.map((change) => `${change.type}: ${change.file}`),
    decisions: collectDecisionLines(session.decisions, decisionsFile),
    blockers: [],
    nextSteps: session.nextSteps,
    safetyBoundaries: [
      "禁止读取或输出 token、cookie、密码、私钥、证书私钥、浏览器凭据、.ssh 私钥内容。",
      "禁止修改 Startup、Run/RunOnce、计划任务、PowerShell Profile，除非用户明确要求并二次确认。",
      "只做与当前任务相关的最小修改。",
      memory ? "已加载项目 MEMORY.md 摘要源。" : "未找到项目 MEMORY.md。",
    ],
    providerResumeCommand:
      session.provider === "codex" && session.providerSessionId ? `codex resume ${session.providerSessionId}` : undefined,
  };
}

function firstPresent(...values: Array<string | undefined>): string {
  return values.find((value) => value && value.trim().length > 0) || "未记录";
}

function collectDecisionLines(sessionDecisions: string[], decisionFile?: string): string[] {
  const output = [...sessionDecisions];
  if (decisionFile) {
    const headings = decisionFile
      .split(/\r?\n/)
      .filter((line) => /^##\s+/.test(line))
      .slice(0, 5);
    output.push(...headings);
  }
  return output.length ? output : ["未记录"];
}

