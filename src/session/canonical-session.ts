export type Provider = "codex" | "openclaw" | "claude" | "gemini" | "generic";

export interface CanonicalMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  createdAt: string;
  content: string;
}

export interface CanonicalToolCall {
  id: string;
  name: string;
  startedAt: string;
  endedAt?: string;
  inputSummary?: string;
  outputSummary?: string;
  exitCode?: number;
  risk?: string;
}

export interface FileChange {
  type: "added" | "modified" | "deleted";
  file: string;
  risk: "low" | "medium" | "high";
}

export interface CommandRecord {
  command: string;
  exitCode?: number;
  startedAt: string;
  endedAt?: string;
  risk: "low" | "medium" | "high";
  reason?: string;
}

export interface RiskEvent {
  level: "low" | "medium" | "high";
  type: string;
  detail: string;
  recommendation: string;
}

export interface GitState {
  branch?: string;
  commit?: string;
  dirty?: boolean;
  summary?: string;
}

export interface CanonicalSession {
  id: string;
  provider: Provider;
  providerSessionId?: string;
  workspace: string;
  startedAt: string;
  endedAt?: string;
  status: "running" | "paused" | "completed" | "failed";
  goal?: string;
  summary?: string;
  messages: CanonicalMessage[];
  toolCalls: CanonicalToolCall[];
  fileChanges: FileChange[];
  commands: CommandRecord[];
  decisions: string[];
  risks: RiskEvent[];
  nextSteps: string[];
  git?: GitState;
  reportPath?: string;
  snapshots?: {
    before?: string;
    after?: string;
  };
}
