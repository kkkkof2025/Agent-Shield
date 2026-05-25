import { commandRules } from "./risk-rules";
import { redactText } from "../utils/redaction";

export interface CommandRisk {
  level: "low" | "medium" | "high";
  reason?: string;
  command: string;
}

export function classifyCommand(command: string): CommandRisk {
  const redacted = redactText(command);
  for (const rule of commandRules) {
    if (rule.pattern.test(redacted)) {
      return { level: rule.level, reason: rule.reason, command: redacted };
    }
  }
  return { level: "low", command: redacted };
}

