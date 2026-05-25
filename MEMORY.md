# Project Memory

- Project: AgentShield Runtime.
- Purpose: local AI CLI wrapper for launch, session tracking, recovery prompts, snapshots, reports, and safety auditing.
- Tech stack: TypeScript + Node.js.
- Phase 1: wrapper MVP using Node standard library and TypeScript build tooling.
- Runtime data: stored under `data/` in this repository for MVP; target workspaces receive `.agent-shield/session-summary.md`.
- Sensitive content policy: metadata only for sensitive paths; never read or store credential contents.

