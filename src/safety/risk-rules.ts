export interface CommandRule {
  pattern: RegExp;
  level: "medium" | "high";
  reason: string;
}

export const commandRules: CommandRule[] = [
  { pattern: /powershell(?:\.exe)?\s+.*-encodedcommand/i, level: "high", reason: "Encoded PowerShell command" },
  { pattern: /pwsh(?:\.exe)?\s+.*-encodedcommand/i, level: "high", reason: "Encoded PowerShell command" },
  { pattern: /\b(invoke-expression|iex)\b/i, level: "high", reason: "Dynamic PowerShell execution" },
  { pattern: /\bfrombase64string\b/i, level: "high", reason: "Base64 decoding in command" },
  { pattern: /\b(curl|iwr|invoke-webrequest)\b.+\|\s*(powershell|iex)/i, level: "high", reason: "Remote script pipe to shell" },
  { pattern: /\b(wget|curl|iwr|invoke-webrequest)\b.+\|\s*(bash|sh|zsh|pwsh)/i, level: "high", reason: "Remote script pipe to shell" },
  { pattern: /\breg(?:\.exe)?\s+add\b.+\\run(?:once)?\b/i, level: "high", reason: "Run/RunOnce persistence change" },
  { pattern: /\bschtasks(?:\.exe)?\s+\/create\b/i, level: "high", reason: "Scheduled task creation" },
  { pattern: /\bNew-ScheduledTask\b|\bRegister-ScheduledTask\b/i, level: "high", reason: "Scheduled task creation" },
  { pattern: /Start\s+Menu\\Programs\\Startup/i, level: "high", reason: "Startup folder modification" },
  { pattern: /\$PROFILE|Microsoft\.PowerShell_profile\.ps1/i, level: "high", reason: "PowerShell profile modification" },
  { pattern: /\.(ssh|codex\\auth\.json)|\\\.ssh\\|\/\.ssh\//i, level: "high", reason: "Sensitive credential path access" },
  { pattern: /\b(wscript|cscript|mshta)(?:\.exe)?\b/i, level: "medium", reason: "Script host execution" },
  { pattern: /\brundll32(?:\.exe)?\b|\bregsvr32(?:\.exe)?\b/i, level: "medium", reason: "LOLBins execution" },
  { pattern: /\bcertutil(?:\.exe)?\b.+(-decode|-urlcache)/i, level: "medium", reason: "certutil decode/download behavior" },
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
