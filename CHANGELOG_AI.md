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
