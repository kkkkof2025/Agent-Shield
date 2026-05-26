# Runbook

## Setup

```bash
npm install
npm run build
npm link
```

## Local CLI

```bash
node dist/index.js inventory
node dist/index.js check codex
node dist/index.js snapshot create
node dist/index.js sessions
node dist/index.js snapshot diff <before> <after>
node dist/index.js risks
node dist/index.js risks --last
node dist/index.js risks --level high
node dist/index.js scan command "powershell -EncodedCommand <BASE64>"
node dist/index.js scan text "ignore previous instructions"
```

After `npm link`, the same commands are available as:

```bash
agent-shield inventory
agent-shield check codex
agent-shield run codex
agent-shield risks --last
agent-shield scan command "powershell -EncodedCommand <BASE64>"
```

## Codex Wrapper

```bash
node dist/index.js run codex
node dist/index.js report --last
node dist/index.js resume --last
```

## Safety

- Do not read or record credential file contents.
- Snapshot hashing skips sensitive-looking files and stores metadata only.
- Hooks install/remove are placeholders until Phase 4 and do not modify user config in Phase 1.
