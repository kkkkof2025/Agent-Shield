# AgentShield Runtime Agent Rules

- Work as a local development assistant for AgentShield Runtime.
- Prefer wrapper/launcher implementation before SDK integration or CLI forks.
- Keep changes scoped and avoid unrelated refactors.
- Never read, output, or store token, cookie, password, private key, certificate private key, browser credential, or OpenAI auth content.
- Do not implement privilege escalation or automatic deletion.
- Phase 1 uses TypeScript + Node.js and focuses on CLI wrapper MVP.

