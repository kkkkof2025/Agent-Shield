import { classifyCommand, CommandRisk } from "./command-risk";
import { classifyPathRisk } from "./path-guard";

export function evaluateCommand(command: string): CommandRisk {
  return classifyCommand(command);
}

export function evaluateFileChange(filePath: string): "low" | "medium" | "high" {
  return classifyPathRisk(filePath);
}

