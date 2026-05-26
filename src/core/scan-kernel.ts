import path from "node:path";
import { promises as fs } from "node:fs";
import { classifyCommand } from "../safety/command-risk";
import { classifyTextRisks, TextRiskFinding } from "../safety/text-risk";
import { isSensitivePath, redactText } from "../utils/redaction";

export interface ScanOptions {
  json?: boolean;
}

export interface ScanFinding extends TextRiskFinding {
  source: string;
}

export async function scanCommandText(command: string, options: ScanOptions = {}): Promise<string> {
  const commandRisk = classifyCommand(command);
  const findings: ScanFinding[] = [];
  if (commandRisk.level !== "low") {
    findings.push({
      source: "command",
      level: commandRisk.level,
      type: "command",
      detail: commandRisk.reason || "Risky command pattern",
      recommendation: "Do not execute unless explicitly confirmed and reviewed.",
    });
  }
  for (const finding of classifyTextRisks(command)) {
    findings.push({ ...finding, source: "command" });
  }
  return renderScanFindings(dedupe(findings), options);
}

export async function scanPlainText(text: string, options: ScanOptions = {}): Promise<string> {
  return renderScanFindings(
    classifyTextRisks(text).map((finding) => ({ ...finding, source: "text" })),
    options,
  );
}

export async function scanFile(filePath: string, options: ScanOptions = {}): Promise<string> {
  const absolute = path.resolve(filePath);
  if (isSensitivePath(absolute)) {
    return renderScanFindings(
      [
        {
          source: absolute,
          level: "high",
          type: "sensitive-file",
          detail: "Refusing to read sensitive file content",
          recommendation: "Record metadata only and ask the user to confirm locally.",
        },
      ],
      options,
    );
  }
  const stat = await fs.stat(absolute);
  if (stat.size > 1024 * 1024) {
    return renderScanFindings(
      [
        {
          source: absolute,
          level: "medium",
          type: "large-file",
          detail: "File is too large for inline text scan",
          recommendation: "Scan targeted excerpts or use a streaming analyzer.",
        },
      ],
      options,
    );
  }
  const content = await fs.readFile(absolute, "utf8");
  return renderScanFindings(
    classifyTextRisks(content).map((finding) => ({ ...finding, source: absolute })),
    options,
  );
}

function renderScanFindings(findings: ScanFinding[], options: ScanOptions): string {
  if (options.json) return `${JSON.stringify(findings, null, 2)}\n`;
  if (findings.length === 0) return "No scan findings.";
  return [
    "Scan findings:",
    ...findings.map(
      (finding) =>
        `- ${finding.level.toUpperCase()} | ${finding.type} | ${redactText(finding.detail)} | source=${finding.source} | recommendation=${finding.recommendation}`,
    ),
  ].join("\n");
}

function dedupe(findings: ScanFinding[]): ScanFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.source}|${finding.level}|${finding.type}|${finding.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

