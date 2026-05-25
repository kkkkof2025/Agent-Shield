import { AgentAdapter, AgentCheckResult } from "./agent-adapter";
import { checkGeneric } from "./generic-cli-adapter";

export class ClaudeAdapter implements AgentAdapter {
  provider = "claude" as const;

  check(_workspace: string): Promise<AgentCheckResult> {
    return checkGeneric("claude", "claude");
  }
}
