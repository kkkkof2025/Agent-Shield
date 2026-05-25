import { getLastSession, listSessions } from "../session/session-registry";
import { Provider } from "../session/canonical-session";

export async function printSessions(filter: { provider?: Provider; workspace?: string }): Promise<string> {
  const sessions = await listSessions(filter);
  if (sessions.length === 0) return "No AgentShield sessions found.";
  return sessions
    .map((session) =>
      [
        session.id,
        `provider=${session.provider}`,
        `status=${session.status}`,
        `started=${session.startedAt}`,
        `workspace=${session.workspace}`,
      ].join(" | "),
    )
    .join("\n");
}

export async function requireLastSession() {
  const session = await getLastSession();
  if (!session) throw new Error("No AgentShield session found.");
  return session;
}

