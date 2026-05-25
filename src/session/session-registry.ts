import path from "node:path";
import { promises as fs } from "node:fs";
import { CanonicalSession, Provider } from "./canonical-session";
import { ensureDir, readJsonIfExists, runtimeDataDir, writeJson } from "../utils/fs-safe";

export function sessionPath(id: string): string {
  return path.join(runtimeDataDir(), "sessions", "canonical", `${id}.json`);
}

export async function saveSession(session: CanonicalSession): Promise<void> {
  await writeJson(sessionPath(session.id), session);
}

export async function getSession(id: string): Promise<CanonicalSession | undefined> {
  return readJsonIfExists<CanonicalSession>(sessionPath(id));
}

export interface SessionFilter {
  provider?: Provider;
  workspace?: string;
}

export async function listSessions(filter: SessionFilter = {}): Promise<CanonicalSession[]> {
  const dir = path.join(runtimeDataDir(), "sessions", "canonical");
  await ensureDir(dir);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const sessions: CanonicalSession[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const session = await readJsonIfExists<CanonicalSession>(path.join(dir, entry.name));
    if (!session) continue;
    if (filter.provider && session.provider !== filter.provider) continue;
    if (filter.workspace && path.resolve(session.workspace) !== path.resolve(filter.workspace)) continue;
    sessions.push(session);
  }
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getLastSession(filter: SessionFilter = {}): Promise<CanonicalSession | undefined> {
  const [session] = await listSessions(filter);
  return session;
}

