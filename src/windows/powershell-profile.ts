import os from "node:os";
import path from "node:path";

export function powershellProfilePaths(): string[] {
  const home = os.homedir();
  return [
    path.join(home, "Documents", "PowerShell", "Microsoft.PowerShell_profile.ps1"),
    path.join(home, "Documents", "WindowsPowerShell", "Microsoft.PowerShell_profile.ps1"),
  ];
}

