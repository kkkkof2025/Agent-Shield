import { evaluateCommand } from "../safety/policy-engine";

export function explainCommandRisk(command: string): string {
  const risk = evaluateCommand(command);
  return `${risk.level}: ${risk.reason || "No high-risk pattern matched"}`;
}

