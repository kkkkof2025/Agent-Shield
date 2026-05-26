import { commandRules } from "./risk-rules";
import { classifyTextRisks } from "./text-risk";
import { redactText } from "../utils/redaction";

export interface CommandRisk {
  level: "low" | "medium" | "high";
  reason?: string;
  command: string;
}

export function classifyCommandPattern(command: string): CommandRisk {
  const redacted = redactText(command);
  for (const rule of commandRules) {
    if (rule.pattern.test(redacted)) {
      return { level: rule.level, reason: rule.reason, command: redacted };
    }
  }
  return { level: "low", command: redacted };
}

export function classifyCommand(command: string): CommandRisk {
  const commandRisk = classifyCommandPattern(command);
  if (commandRisk.level !== "low") return commandRisk;
  const redacted = commandRisk.command;
  const [textRisk] = classifyTextRisks(redacted);
  if (textRisk) {
    return { level: textRisk.level, reason: textRisk.detail, command: redacted };
  }
  return { level: "low", command: redacted };
}
