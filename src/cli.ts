import path from "node:path";
import { CodexAdapter, resumeCodex, runCodex } from "./adapters/codex-adapter";
import { ClaudeAdapter } from "./adapters/claude-adapter";
import { OpenClawAdapter } from "./adapters/openclaw-adapter";
import { checkGeneric } from "./adapters/generic-cli-adapter";
import { AgentCheckResult } from "./adapters/agent-adapter";
import { createSnapshot, showSnapshotDiff } from "./core/snapshot-kernel";
import { printSessions } from "./core/session-kernel";
import { showMemory } from "./core/memory-kernel";
import { writeSessionReport } from "./core/report-kernel";
import { queryRisks } from "./core/risk-kernel";
import { scanCommandText, scanFile, scanPlainText } from "./core/scan-kernel";
import { evaluateCommand } from "./safety/policy-engine";
import { getLastSession, getSession, listSessions } from "./session/session-registry";
import { Provider } from "./session/canonical-session";
import { resolveSessionForResume } from "./session/resume-engine";
import { getSystemInventory } from "./snapshot/system-snapshot";
import { getWindowsPersistenceStatus } from "./snapshot/persistence-snapshot";
import { printError, printInfo } from "./utils/logger";
import { spawnPassthroughPortable } from "./utils/process";

export async function main(argv = process.argv): Promise<void> {
  const args = normalizeArgs(argv.slice(2));
  const command = args[0];

  try {
    switch (command) {
      case "inventory":
        printInfo(await inventory());
        return;
      case "check":
        printInfo(await check(args[1]));
        return;
      case "run":
        await run(args.slice(1));
        return;
      case "sessions":
        printInfo(await sessions(args.slice(1)));
        return;
      case "resume":
        await resume(args.slice(1));
        return;
      case "snapshot":
        printInfo(await snapshot(args.slice(1)));
        return;
      case "report":
        printInfo(await report(args.slice(1)));
        return;
      case "risks":
        printInfo(await risks(args.slice(1)));
        return;
      case "scan":
        printInfo(await scan(args.slice(1)));
        return;
      case "memory":
        printInfo(await memory(args.slice(1)));
        return;
      case "hooks":
        printInfo(hooks(args.slice(1)));
        return;
      case "-h":
      case "--help":
      case undefined:
        printInfo(help());
        return;
      default:
        throw new Error(`Unknown command: ${command}\n\n${help()}`);
    }
  } catch (error) {
    printError((error as Error).message);
    process.exitCode = 1;
  }
}

async function inventory(): Promise<string> {
  const workspace = process.cwd();
  const system = getSystemInventory();
  const checks = await Promise.all([
    new CodexAdapter().check(workspace),
    new OpenClawAdapter().check(workspace),
    new ClaudeAdapter().check(workspace),
    checkGeneric("gemini", "gemini"),
    checkGeneric("generic", "aider"),
  ]);
  const persistence = await getWindowsPersistenceStatus();
  const lines = [
    "AgentShield inventory",
    `Workspace: ${workspace}`,
    `Platform: ${system.platform} ${system.arch}`,
    `Node: ${system.node}`,
    "",
    "Agents:",
    ...checks.map(formatCheckOneLine),
    "",
    "Windows persistence locations:",
    ...(persistence.length ? persistence.map((item) => `- ${item.name}: ${item.exists ? "exists" : "missing"} (${item.path})`) : ["- not applicable"]),
  ];
  return lines.join("\n");
}

async function check(provider?: string): Promise<string> {
  const workspace = process.cwd();
  if (!provider) throw new Error("Usage: agent-shield check <codex|openclaw|claude>");
  const result =
    provider === "codex"
      ? await new CodexAdapter().check(workspace)
      : provider === "openclaw"
        ? await new OpenClawAdapter().check(workspace)
        : provider === "claude"
          ? await new ClaudeAdapter().check(workspace)
          : undefined;
  if (!result) throw new Error(`Unsupported provider: ${provider}`);
  return formatCheck(result);
}

async function run(args: string[]): Promise<void> {
  const provider = args[0];
  if (provider === "codex") {
    const session = await runCodex(process.cwd(), args.slice(1));
    printInfo(`AgentShield session recorded: ${session.id}`);
    printInfo(renderRunSummary(session));
    return;
  }
  if (provider === "--name") {
    const separator = args.indexOf("--");
    const name = args[1] || "custom";
    const allowHighRisk = args.includes("--allow-high-risk");
    if (separator === -1 || separator === args.length - 1) throw new Error("Usage: agent-shield run --name custom -- <command>");
    const commandText = args.slice(separator + 1).join(" ");
    const commandRisk = evaluateCommand(commandText);
    if (commandRisk.level === "high" && !allowHighRisk) {
      printError(`Blocked high-risk command: ${commandRisk.reason || "risk rule matched"}`);
      printError("Re-run with --allow-high-risk only after explicit review.");
      process.exitCode = 2;
      return;
    }
    const exitCode = await spawnPassthroughPortable(args[separator + 1], args.slice(separator + 2), process.cwd());
    printInfo(`Custom command '${name}' exited with code ${exitCode}.`);
    process.exitCode = exitCode;
    return;
  }
  throw new Error("Usage: agent-shield run codex [args...]");
}

async function sessions(args: string[]): Promise<string> {
  const provider = readFlag(args, "--provider") as Provider | undefined;
  const workspaceFlag = readFlag(args, "--workspace");
  const workspace = workspaceFlag === "." ? process.cwd() : workspaceFlag;
  return printSessions({ provider, workspace });
}

async function resume(args: string[]): Promise<void> {
  let session;
  if (args[0] === "--last") {
    session = await resolveSessionForResume();
  } else if (args[0] === "--provider") {
    const provider = args[1] as Provider | undefined;
    const providerSessionId = args[2];
    const matches = await listSessions({ provider });
    session = matches.find((item) => item.providerSessionId === providerSessionId);
    if (!session) throw new Error(`No AgentShield session found for provider session: ${providerSessionId}`);
  } else {
    session = await resolveSessionForResume(args[0]);
  }

  if (session.provider !== "codex") {
    throw new Error(`Resume is only implemented for codex in Phase 1. Session provider: ${session.provider}`);
  }
  const exitCode = await resumeCodex(session);
  process.exitCode = exitCode;
}

async function snapshot(args: string[]): Promise<string> {
  if (args[0] === "create") return createSnapshot(process.cwd());
  if (args[0] === "diff" && args[1] && args[2]) return showSnapshotDiff(args[1], args[2]);
  throw new Error("Usage: agent-shield snapshot create | agent-shield snapshot diff <before> <after>");
}

async function report(args: string[]): Promise<string> {
  const session = args[0] === "--last" || !args[0] ? await getLastSession() : await getSession(args[0]);
  if (!session) throw new Error("Session not found.");
  const reportPath = await writeSessionReport(session);
  return `Report written: ${reportPath}`;
}

async function risks(args: string[]): Promise<string> {
  const level = readFlag(args, "--level") as "low" | "medium" | "high" | undefined;
  if (level && !["low", "medium", "high"].includes(level)) {
    throw new Error("Usage: agent-shield risks [--last] [--level low|medium|high] [--json]");
  }
  return queryRisks({
    last: args.includes("--last"),
    level,
    json: args.includes("--json"),
  });
}

async function scan(args: string[]): Promise<string> {
  const json = args.includes("--json");
  const filtered = args.filter((arg) => arg !== "--json");
  const target = filtered[0];
  const value = filtered.slice(1).join(" ");
  if (target === "command" && value) return scanCommandText(value, { json });
  if (target === "text" && value) return scanPlainText(value, { json });
  if (target === "file" && filtered[1]) return scanFile(filtered[1], { json });
  throw new Error("Usage: agent-shield scan command <command> [--json] | scan text <text> [--json] | scan file <path> [--json]");
}

async function memory(args: string[]): Promise<string> {
  if (args[0] === "show") return showMemory(process.cwd());
  if (args[0] === "update") return "Memory update is handled by AgentShield session finalization in Phase 1.";
  throw new Error("Usage: agent-shield memory show | agent-shield memory update");
}

function hooks(args: string[]): string {
  if (args[0] === "install" && args[1] === "codex") {
    return "Codex hooks install is planned for Phase 4; no user config was modified.";
  }
  if (args[0] === "remove" && args[1] === "codex") {
    return "Codex hooks remove is planned for Phase 4; no user config was modified.";
  }
  throw new Error("Usage: agent-shield hooks install codex | agent-shield hooks remove codex");
}

function formatCheck(result: AgentCheckResult): string {
  return [
    `${result.provider}: ${result.installed ? "installed" : "missing"}`,
    `Command: ${result.command}`,
    `Version: ${result.version || "unknown"}`,
    ...result.notes.map((note) => `- ${note}`),
  ].join("\n");
}

function formatCheckOneLine(result: AgentCheckResult): string {
  return `- ${result.provider}: ${result.installed ? "installed" : "missing"}${result.version ? ` (${result.version})` : ""}`;
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function normalizeArgs(args: string[]): string[] {
  return args[0] === "agent-shield" ? args.slice(1) : args;
}

function renderRunSummary(session: { status: string; reportPath?: string; risks: Array<{ level: string; type: string; detail: string }> }): string {
  const high = session.risks.filter((risk) => risk.level === "high").length;
  const medium = session.risks.filter((risk) => risk.level === "medium").length;
  const lines = [
    `Status: ${session.status}`,
    `Report: ${session.reportPath || "not recorded"}`,
    `Risk summary: high=${high}, medium=${medium}`,
  ];
  if (session.risks.length > 0) {
    lines.push("Risks:");
    for (const risk of session.risks.slice(0, 10)) {
      lines.push(`- ${risk.level.toUpperCase()} | ${risk.type} | ${risk.detail}`);
    }
  }
  return lines.join("\n");
}

function help(): string {
  return `AgentShield Runtime

Usage:
  agent-shield inventory
  agent-shield check codex|openclaw|claude
  agent-shield run codex [args...]
  agent-shield run --name custom -- <command>
  agent-shield sessions [--provider codex] [--workspace .]
  agent-shield resume --last
  agent-shield resume <agent-shield-session-id>
  agent-shield resume --provider codex <codex-session-id>
  agent-shield snapshot create
  agent-shield snapshot diff <before> <after>
  agent-shield report --last
  agent-shield report <session-id>
  agent-shield risks [--last] [--level low|medium|high] [--json]
  agent-shield scan command <command> [--json]
  agent-shield scan text <text> [--json]
  agent-shield scan file <path> [--json]
  agent-shield memory show
  agent-shield memory update
  agent-shield hooks install codex
  agent-shield hooks remove codex`;
}
