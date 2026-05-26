import path from "node:path";
import { AgentAdapter, AgentCheckResult } from "./agent-adapter";
import { commandExists, getCommandVersion } from "./generic-cli-adapter";
import { inspectCodexConfig } from "../codex/codex-config";
import { findLatestCodexSession, scanCodexSessionRisks } from "../codex/codex-session-reader";
import { createProjectSnapshot } from "../snapshot/project-snapshot";
import { diffSnapshots } from "../snapshot/snapshot-diff";
import { CanonicalSession, GitState, RiskEvent } from "../session/canonical-session";
import { evaluateCommand } from "../safety/policy-engine";
import { saveSession } from "../session/session-registry";
import { writeSessionReport } from "../core/report-kernel";
import { isoNow, runtimeDataDir, timestampForFile, writeText, workspaceSummaryPath } from "../utils/fs-safe";
import { renderRecoveryPrompt } from "../memory/recovery-context";
import { buildRecoveryContext } from "../session/resume-engine";
import { runCapture, spawnPassthroughPortable, spawnWithInputPortable } from "../utils/process";

export class CodexAdapter implements AgentAdapter {
  provider = "codex" as const;

  async check(workspace: string): Promise<AgentCheckResult> {
    const installed = await commandExists("codex");
    const version = installed ? await getCommandVersion("codex") : undefined;
    const notes = await inspectCodexConfig(workspace);
    if (!installed) notes.unshift("codex was not found on PATH.");
    return {
      provider: "codex",
      installed,
      command: "codex",
      version,
      notes,
    };
  }
}

export async function runCodex(workspace: string, codexArgs: string[]): Promise<CanonicalSession> {
  const adapter = new CodexAdapter();
  const check = await adapter.check(workspace);
  if (!check.installed) throw new Error("Codex CLI is not installed or not on PATH.");

  const startedAt = new Date();
  const before = await createProjectSnapshot(workspace);
  const git = await getGitState(workspace);
  const commandText = ["codex", ...codexArgs].join(" ");
  const commandRisk = evaluateCommand(commandText);
  const exitCode = await spawnPassthroughPortable("codex", codexArgs, workspace);
  const endedAt = new Date();
  const after = await createProjectSnapshot(workspace);
  const snapshotDiff = await diffSnapshots(before.id, after.id);
  const latestCodexSession = await findLatestCodexSession(startedAt.getTime());
  const codexSessionRisks = await scanCodexSessionRisks(latestCodexSession);
  const fileChanges = [...snapshotDiff.added, ...snapshotDiff.modified, ...snapshotDiff.deleted];
  const risks: RiskEvent[] = fileChanges
    .filter((change) => change.risk !== "low")
    .map((change) => ({
      level: change.risk,
      type: "file-change",
      detail: `${change.type}: ${change.file}`,
      recommendation: "Review this change before committing.",
    }));
  if (commandRisk.level !== "low") {
    risks.push({
      level: commandRisk.level,
      type: "command",
      detail: commandRisk.reason || "Risky command pattern",
      recommendation: "Confirm this command was intentional.",
    });
  }
  risks.push(...codexSessionRisks);

  const session: CanonicalSession = {
    id: `as_${timestampForFile(startedAt)}_codex`,
    provider: "codex",
    providerSessionId: latestCodexSession?.providerSessionId,
    workspace: path.resolve(workspace),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    status: exitCode === 0 ? "completed" : "failed",
    goal: codexArgs.join(" ") || "Codex CLI interactive session",
    summary: `Codex exited with code ${exitCode}. File changes detected: ${fileChanges.length}. Session text risks detected: ${codexSessionRisks.length}.`,
    messages: [],
    toolCalls: [],
    fileChanges,
    commands: [
      {
        command: commandRisk.command,
        exitCode,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        risk: commandRisk.level,
        reason: commandRisk.reason,
      },
    ],
    decisions: [],
    risks,
    nextSteps: ["Review the generated session report.", "Run snapshot diff if deeper inspection is needed."],
    git,
    snapshots: {
      before: before.id,
      after: after.id,
    },
  };

  await saveSession(session);
  const reportPath = await writeSessionReport(session);
  session.reportPath = reportPath;
  await saveSession(session);
  await updateAgentShieldSummary(session, reportPath);
  return session;
}

export async function resumeCodex(session: CanonicalSession): Promise<number> {
  const context = await buildRecoveryContext(session);
  const prompt = renderRecoveryPrompt(context);
  const promptPath = path.join(runtimeDataDir(), "sessions", "summaries", `${session.id}_recovery_prompt.md`);
  await writeText(promptPath, prompt);
  const args = session.providerSessionId ? ["resume", session.providerSessionId] : [];
  return spawnWithInputPortable("codex", args, prompt, session.workspace);
}

async function getGitState(workspace: string): Promise<GitState | undefined> {
  const branch = await gitOutput(workspace, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const commit = await gitOutput(workspace, ["rev-parse", "HEAD"]);
  const status = await gitOutput(workspace, ["status", "--short"]);
  if (!branch && !commit && !status) return undefined;
  return {
    branch,
    commit,
    dirty: Boolean(status),
    summary: status || "clean",
  };
}

function gitOutput(cwd: string, args: string[]): Promise<string | undefined> {
  return runCapture("git", args, cwd).then((result) => (result.code === 0 ? result.stdout.trim() : undefined), () => undefined);
}

async function updateAgentShieldSummary(session: CanonicalSession, reportPath: string): Promise<void> {
  const changedFiles = session.fileChanges.map((change) => `- ${change.type}: ${change.file} (${change.risk})`).join("\n");
  const content = `# 最近会话摘要

## 当前目标
${session.goal || "Codex CLI interactive session"}

## 已完成
- AgentShield 管理了一次 ${session.provider} 会话。
- 创建 before/after snapshot 并生成 Markdown 报告。

## 修改文件
${changedFiles || "- 未检测到工作区文件变化。"}

## 关键决策
- Phase 1 仅记录会话元数据、快照差异和报告，不读取认证文件内容。

## 未完成
- 后续可接入 Codex SDK runtime 和更完整的 session import。

## 下一步建议
- 查看报告：${reportPath}
- 恢复会话：agent-shield resume ${session.id}
- 查询风险：agent-shield risks --last

## 风险提醒
${session.risks.length ? session.risks.map((risk) => `- ${risk.level}: ${risk.detail}`).join("\n") : "- 未发现高风险事件。"}

更新时间：${isoNow()}
`;
  await writeText(workspaceSummaryPath(session.workspace), content);
}
