# AgentShield Runtime

[English](README.md) | [简体中文](README.zh-CN.md)

AgentShield Runtime is a local AI CLI wrapper for Codex CLI, OpenClaw, Claude Code, Gemini CLI, Aider, and other command-line agents.

It is not antivirus, EDR, malware analysis tooling, privilege escalation tooling, or credential extraction tooling.

## Current Status

Phase 1 is implemented and usable:

- `inventory`
- `check codex`
- `snapshot create`
- `snapshot diff`
- `run codex`
- `sessions`
- `resume --last`
- `report`
- `risks`

What works now:

- Local `agent-shield` binary via `npm link`
- Windows-compatible Codex shim launching
- Session metadata capture
- Before/after workspace snapshots
- Markdown reports
- Risk history query
- `.agent-shield/session-summary.md` updates

What is still future work:

- Phase 2 Codex SDK runtime
- Phase 3 multi-agent adapters
- Phase 4 hooks and guardrails
- Full interactive `run codex` and `resume --last` validation in a real TTY

See [TODO.md](TODO.md) for the tracked roadmap.

## Quick Start

```bash
cd agent-shield-runtime
npm install
npm run build
npm link
```

After linking, use the binary directly:

```bash
agent-shield inventory
agent-shield check codex
agent-shield run codex
agent-shield risks --last
```

If you prefer running the compiled script directly, use the file path only:

```bash
node .\dist\index.js inventory
node .\dist\index.js check codex
node .\dist\index.js run codex
```

Do not add `agent-shield` after `dist/index.js`.

## Commands

```bash
agent-shield inventory
agent-shield check codex
agent-shield check openclaw
agent-shield check claude
agent-shield run codex
agent-shield run --name custom -- <command>
agent-shield sessions
agent-shield resume --last
agent-shield snapshot create
agent-shield snapshot diff <before> <after>
agent-shield report --last
agent-shield memory show
agent-shield memory update
agent-shield risks
agent-shield risks --last
agent-shield risks --level high
agent-shield risks --json
agent-shield hooks install codex
agent-shield hooks remove codex
```

## How It Behaves

`run codex`:

1. Checks whether `codex` exists.
2. Reads Codex config presence only, not credential contents.
3. Creates a before snapshot.
4. Runs Codex.
5. Creates an after snapshot.
6. Builds a canonical session record.
7. Writes a Markdown report.
8. Updates `.agent-shield/session-summary.md`.

`resume --last`:

1. Finds the latest AgentShield session.
2. Rebuilds recovery context from memory files and session metadata.
3. Injects a recovery prompt.
4. Starts Codex resume in a Windows-safe way.

## Safety Notes

- Never read or store token, cookie, password, private key, certificate private key, or browser credential contents.
- Sensitive paths are recorded as metadata only.
- Hooks installation/removal is still a placeholder in Phase 1.

## Querying Risk History

Risk history is stored in canonical session JSON files and Markdown reports under `data/`. Use the CLI first:

```bash
agent-shield risks
agent-shield risks --last
agent-shield risks --level medium
agent-shield risks --level high
agent-shield risks --json
```

Example: after an AgentShield-managed session creates or modifies a `.ps1` file, query the latest session:

```bash
agent-shield risks --last
```

Expected output shape:

```text
Risk records:
- MEDIUM | file-change | added: scripts/demo.ps1 | session=as_... | started=...
```

You can also generate or reopen the Markdown report:

```bash
agent-shield report --last
```

Then check these sections:

- `文件变化`
- `命令记录`
- `高风险事件`

If you created a `.ps1` file outside an AgentShield-managed session, AgentShield will not know about that operation automatically. Use snapshots to compare manual changes:

```bash
agent-shield snapshot create
# make file changes
agent-shield snapshot create
agent-shield snapshot diff <before> <after>
```

## Project Layout

- `src/` contains the TypeScript implementation.
- `rules/` contains baseline policy files.
- `templates/` contains recovery and report templates.
- `data/` stores local session, snapshot, report, and memory artifacts.
- `data/sessions/canonical/` stores canonical session JSON records.
- `data/reports/` stores Markdown session reports.
