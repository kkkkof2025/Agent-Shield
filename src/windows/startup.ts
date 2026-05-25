import os from "node:os";
import path from "node:path";

export function startupDirectories(): string[] {
  if (process.platform !== "win32") return [];
  return [
    path.join(process.env.APPDATA || "", "Microsoft", "Windows", "Start Menu", "Programs", "Startup"),
    path.join(process.env.PROGRAMDATA || "", "Microsoft", "Windows", "Start Menu", "Programs", "Startup"),
    path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup"),
  ];
}

