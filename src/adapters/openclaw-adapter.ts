import { AgentAdapter, AgentCheckResult } from "./agent-adapter";
import { checkGeneric } from "./generic-cli-adapter";

export class OpenClawAdapter implements AgentAdapter {
  provider = "openclaw" as const;

  check(_workspace: string): Promise<AgentCheckResult> {
    return checkGeneric("openclaw", "openclaw");
  }
}
