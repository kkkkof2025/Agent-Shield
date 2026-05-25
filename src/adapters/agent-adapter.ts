import { Provider } from "../session/canonical-session";

export interface AgentCheckResult {
  provider: Provider;
  installed: boolean;
  command: string;
  version?: string;
  notes: string[];
}

export interface AgentAdapter {
  provider: Provider;
  check(workspace: string): Promise<AgentCheckResult>;
}

