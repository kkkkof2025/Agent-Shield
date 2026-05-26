# AI Changelog

## 2026-05-25

- Initialized AgentShield Runtime project structure.
- Added TypeScript CLI entrypoint and Phase 1 command routing.
- Added Codex check, run, session recording, resume prompt injection, snapshots, diff, report, and memory summary modules.
- Added safety rule modules that classify risky commands and sensitive paths without reading credential contents.
- Added `.gitignore` for dependencies, build output, snapshots, reports, and generated session files.
- Verified with `npm run build`, `inventory`, `check codex`, `sessions`, and snapshot create/diff.
- Fixed Windows CLI startup by routing `.cmd/.ps1` style commands through a portable process helper.
- Added compatibility for accidental `node dist/index.js agent-shield ...` invocation and documented `npm link`.
- Verified `agent-shield inventory` after `npm link`.
- Fixed Windows argument quoting so Codex flags are passed as flags, not quoted interactive prompts.
- Verified `agent-shield check codex` reports `codex-cli 0.133.0` and `agent-shield run codex --version` records a session.
- Updated `README.md` with current progress, quick start, command reference, and behavior notes.
- Added a Chinese user guide, now named `README.zh-CN.md`.
- Added `agent-shield risks` for historical risk queries.
- Marked `.ps1`, `.psm1`, and `.psd1` file changes as medium risk.
- Expanded README examples for querying risk history and using snapshots for out-of-wrapper manual changes.
- Initialized `agent-shield-runtime/` Git repository in preparation for the first GitHub push.
- Created initial commit `699a552 Initial AgentShield Runtime MVP`, added status commit `3a880ad`, configured the GitHub remote, and pushed to `https://github.com/kkkkof2025/Agent-Shield.git`.
- Renamed the Chinese README to `README.zh-CN.md` and added `TODO.md` as the roadmap entry point.

## 2026-05-26

- Added `agent-shield scan command|text|file` for static risk checks without executing commands.
- Expanded command risk rules for encoded PowerShell, remote script pipes, Run/RunOnce, scheduled tasks, Startup folders, PowerShell profiles, sensitive credential paths, and common LOLBins.
- Added text risk detection for prompt injection, role/memory file modification, hidden Unicode, long encoded blobs, AI API endpoint changes, API relay abuse, credential exfiltration wording, and MCP config changes.
- Expanded path risk classification for agent role/memory files, `.codex/.claude/.openclaw`, MCP configs, and PowerShell script files.
- Made `run codex` print the generated report path and high/medium risk summary after the wrapped process exits.
- Made high-risk custom commands block by default in `agent-shield run --name custom -- <command>`.
- Added `docs/security-test-examples.zh-CN.md` with test cases for API relay/公益中转 risks, model substitution, token drain, role modification, hidden payloads, and persistence paths.
- Updated README, README.zh-CN, TODO, and RUNBOOK with the new usage examples and current safety boundaries.
- Created commit `270f77c Enhance safety scanning and reporting` and synced it to GitHub after a force-with-lease update.
- Fixed a report gap where `run codex` only evaluated the outer `codex` command and file diffs. It now scans persisted Codex session text for risky command/text patterns when available.
- Split pure command-pattern detection from text-risk fallback to reduce duplicate `codex-session-command-text` findings.
- Created local commit `3af6ae3 Scan Codex transcripts for session risks`; GitHub push is still pending because the latest push attempt timed out.
