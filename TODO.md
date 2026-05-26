# TODO

This project is not fully complete. Phase 1 is usable; later phases remain planned work.

## Completed

- [x] Initialize TypeScript + Node.js project structure.
- [x] Implement Phase 1 wrapper CLI.
- [x] Implement `inventory`.
- [x] Implement `check codex`.
- [x] Implement `snapshot create`.
- [x] Implement `snapshot diff`.
- [x] Implement `run codex`.
- [x] Implement `sessions`.
- [x] Implement `resume --last` first version.
- [x] Implement Markdown session reports.
- [x] Implement `.agent-shield/session-summary.md` updates.
- [x] Implement `risks` history query.
- [x] Implement static `scan` for command/text/file risk checks.
- [x] Print report path and risk summary after `run codex`.
- [x] Block high-risk custom commands by default.
- [x] Add English and Simplified Chinese README files.
- [x] Push initial project to GitHub.

## Phase 1 Follow-Up

- [ ] Validate full interactive `agent-shield run codex` in a real PowerShell TTY.
- [ ] Validate `agent-shield resume --last` with a real Codex session.
- [ ] Add `agent-shield risks --session <id>`.
- [ ] Improve report fields from parsed Codex JSONL sessions.
- [ ] Add focused automated tests for snapshot diff, risk queries, and command parsing.
- [ ] Turn Codex hook placeholders into real PreToolUse/PostToolUse integrations.

## Phase 2: Codex SDK Runtime

- [ ] Implement `agent-shield chat`.
- [ ] Implement `agent-shield task`.
- [ ] Manage Codex `thread_id`.
- [ ] Auto-inject recovery context into SDK sessions.
- [ ] Generate structured task summaries.

## Phase 3: Multi-Agent Adapter

- [ ] Implement `CodexAdapter` session import/export.
- [ ] Implement `OpenClawAdapter`.
- [ ] Implement `ClaudeAdapter`.
- [ ] Implement `GenericCLIAdapter`.
- [ ] Define and harden canonical session IR.
- [ ] Add cross-CLI session handoff/import/export.

## Phase 4: Hooks And Guardrails

- [ ] Generate Codex hooks config.
- [ ] Implement PreToolUse risk checks.
- [ ] Implement PostToolUse audit logging.
- [ ] Implement UserPromptSubmit memory injection.
- [ ] Implement PreCompact summary save.
- [ ] Implement PostCompact memory update.

## Non-Goals

- [ ] Do not implement antivirus behavior.
- [ ] Do not implement privilege escalation.
- [ ] Do not implement credential extraction.
- [ ] Do not read or store token, cookie, password, private key, certificate private key, or browser credential contents.
