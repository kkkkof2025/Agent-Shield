import { CanonicalSession } from "./canonical-session";

export function exportCanonicalSession(session: CanonicalSession): string {
  return JSON.stringify(session, null, 2);
}

