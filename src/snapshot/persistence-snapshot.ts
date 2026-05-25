import os from "node:os";
import path from "node:path";
import { pathExists } from "../utils/fs-safe";

export interface PersistenceStatus {
  name: string;
  path: string;
  exists: boolean;
}

export async function getWindowsPersistenceStatus(): Promise<PersistenceStatus[]> {
  if (process.platform !== "win32") return [];
  const appData = process.env.APPDATA || "";
  const programData = process.env.PROGRAMDATA || "";
  const home = os.homedir();
  const candidates = [
    ["User Startup", path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup")],
    ["ProgramData Startup", path.join(programData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup")],
    ["PowerShell Profile", path.join(home, "Documents", "PowerShell", "Microsoft.PowerShell_profile.ps1")],
  ];
  return Promise.all(candidates.map(async ([name, filePath]) => ({ name, path: filePath, exists: await pathExists(filePath) })));
}

