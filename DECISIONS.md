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
