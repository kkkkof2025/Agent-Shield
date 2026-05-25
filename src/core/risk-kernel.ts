import { getLastSession, listSessions } from "../session/session-registry";
import { CanonicalSession } from "../session/canonical-session";

export interface RiskQueryOptions {
  last?: boolean;
  level?: "low" | "medium" | "high";
  json?: boolean;
}

export interface RiskRecord {
  sessionId: string;
  provider: string;
  workspace: string;
  startedAt: string;
  level: "low" | "medium" | "high";
  type: string;
  detail: string;
  recommendation?: string;
}

export async function queryRisks(options: RiskQueryOptions = {}): Promise<string> {
  const sessions = options.last ? compact(await getLastSession()) : await listSessions();
  const risks = dedupeRisks(sessions.flatMap(sessionToRiskRecords)).filter((risk) => !options.level || risk.level === options.level);

  if (options.json) return `${JSON.stringify(risks, null, 2)}\n`;
  if (risks.length === 0) return "No risk records found.";

  return [
    "Risk records:",
    ...risks.map(
      (risk) =>
        `- ${risk.level.toUpperCase()} | ${risk.type} | ${risk.detail} | session=${risk.sessionId} | started=${risk.startedAt}`,
    ),
  ].join("\n");
}

function sessionToRiskRecords(session: CanonicalSession): RiskRecord[] {
  const fileRisks = session.fileChanges
    .filter((change) => change.risk !== "low")
    .map((change) => ({
      sessionId: session.id,
      provider: session.provider,
      workspace: session.workspace,
      startedAt: session.startedAt,
      level: change.risk,
      type: "file-change",
      detail: `${change.type}: ${change.file}`,
      recommendation: "Review this file change before trusting or committing it.",
    }));

  const commandRisks = session.commands
    .filter((command) => command.risk !== "low")
    .map((command) => ({
      sessionId: session.id,
      provider: session.provider,
      workspace: session.workspace,
      startedAt: session.startedAt,
      level: command.risk,
      type: "command",
      detail: command.reason ? `${command.command} (${command.reason})` : command.command,
      recommendation: "Confirm this command was intentional.",
    }));

  const eventRisks = session.risks.map((risk) => ({
    sessionId: session.id,
    provider: session.provider,
    workspace: session.workspace,
    startedAt: session.startedAt,
    level: risk.level,
    type: risk.type,
    detail: risk.detail,
    recommendation: risk.recommendation,
  }));

  return [...fileRisks, ...commandRisks, ...eventRisks];
}

function compact<T>(value: T | undefined): T[] {
  return value ? [value] : [];
}

function dedupeRisks(risks: RiskRecord[]): RiskRecord[] {
  const seen = new Set<string>();
  return risks.filter((risk) => {
    const key = `${risk.sessionId}|${risk.level}|${risk.type}|${risk.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
