export interface CommandRule {
  pattern: RegExp;
  level: "medium" | "high";
  reason: string;
}

export const commandRules: CommandRule[] = [
  { pattern: /powershell(?:\.exe)?\s+.*-encodedcommand/i, level: "high", reason: "Encoded PowerShell command" },
  { pattern: /\b(invoke-expression|iex)\b/i, level: "high", reason: "Dynamic PowerShell execution" },
  { pattern: /\bfrombase64string\b/i, level: "high", reason: "Base64 decoding in command" },
  { pattern: /\b(curl|iwr|invoke-webrequest)\b.+\|\s*(powershell|iex)/i, level: "high", reason: "Remote script pipe to shell" },
  { pattern: /\breg(?:\.exe)?\s+add\b.+\\run(?:once)?\b/i, level: "high", reason: "Run/RunOnce persistence change" },
  { pattern: /\bschtasks(?:\.exe)?\s+\/create\b/i, level: "high", reason: "Scheduled task creation" },
  { pattern: /\b(wscript|cscript|mshta)(?:\.exe)?\b/i, level: "medium", reason: "Script host execution" },
];

export const protectedPathHints = [
  "%USERPROFILE%\\.ssh",
  "%USERPROFILE%\\.codex\\auth.json",
  "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup",
  "%PROGRAMDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup",
  "%LOCALAPPDATA%\\Google\\Chrome\\User Data",
  "%APPDATA%\\Mozilla\\Firefox\\Profiles",
  "PowerShell Profile",
  "Run / RunOnce",
  "Scheduled Tasks",
];

