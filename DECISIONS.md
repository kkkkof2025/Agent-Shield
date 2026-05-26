# Decisions

## 2026-05-25 Phase 1 Uses TypeScript Node Wrapper

### 背景
The first milestone must wrap local AI CLI tools without forking Codex CLI.

### 决策
Implement the MVP as a TypeScript + Node.js CLI using Node standard library for process spawning, snapshots, and reports.

### 原因
This keeps the first version small, cross-platform, and ready for later Codex SDK integration.

### 影响
Adds `src/` modules for adapters, snapshots, session registry, reports, safety rules, memory, and CLI routing.

### 回滚方案
Replace the hand-written argument parser with `commander` or `clipanion` while preserving command behavior.

## 2026-05-25 Windows CLI Shim Compatibility

### 背景
Windows 上的 `agent-shield` bin 和 `codex` shim 需要可用，不能依赖 Unix 风格的直接 `spawn`。

### 决策
Use `npm link` for the local bin and a Windows-aware process helper for Codex version checks and process launching.

### 原因
This avoids `ENOENT` on `.cmd`/PowerShell shim resolution and makes the CLI usable from PowerShell.

### 影响
Impacts `src/cli.ts`, `src/utils/process.ts`, `src/adapters/generic-cli-adapter.ts`, and `src/adapters/codex-adapter.ts`.

### 回滚方案
If the helper causes side effects, revert to explicit executable paths and document manual launcher steps.

## 2026-05-26 Static Scan And Pre-Execution Blocking

### 背景
Users need practical safety examples, automatic run-end risk summaries, limited pre-execution blocking, and recognition of role modification, hidden strings, and AI API relay abuse patterns.

### 决策
Add static `scan command|text|file`, expand command/path/text risk rules, print a report/risk summary after `run codex`, and block high-risk custom commands by default.

### 原因
These capabilities fit Phase 1 wrapper boundaries. Codex-internal mid-session tool blocking still requires real Codex hooks or a Codex SDK runtime, so it remains tracked as Phase 4/Phase 2 work.

### 影响
Impacts `src/cli.ts`, `src/core/scan-kernel.ts`, `src/safety/*`, `src/adapters/codex-adapter.ts`, README files, TODO, RUNBOOK, and security test documentation.

### 回滚方案
Tune or disable individual static rules if false positives become too noisy. High-risk custom command blocking can be bypassed only with explicit `--allow-high-risk`.

## 2026-05-26 Best-Effort Codex Transcript Scan

### 背景
A high-risk command entered inside `agent-shield run codex` was refused by Codex, but AgentShield still reported high=0 because the wrapper only evaluated the outer `codex` command and file diff.

### 决策
After `run codex` exits, scan persisted Codex session JSONL text for risky command/text patterns and add generic risk metadata to the canonical session and Markdown report.

### 原因
Phase 1 can inspect local session metadata after the process exits, but it cannot reliably observe Codex's live interactive input stream. Persisted transcript scanning improves reports without storing raw prompts or sensitive content. Full live interception still belongs to hooks or SDK runtime.

### 影响
Impacts `src/codex/codex-session-reader.ts`, `src/adapters/codex-adapter.ts`, `src/safety/command-risk.ts`, `src/safety/risk-rules.ts`, and documentation.

### 回滚方案
Disable transcript scanning or narrow scanned fields if false positives are too noisy. Keep live blocking for the future hooks/SDK implementation.
