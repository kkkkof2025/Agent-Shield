import os from "node:os";
import path from "node:path";
import { pathExists } from "../utils/fs-safe";

export interface AgentConfigStatus {
  agent: string;
  homeConfig?: string;
  workspaceConfig?: string;
  homeConfigExists: boolean;
  workspaceConfigExists: boolean;
}

export async function codexConfigStatus(workspace: string): Promise<AgentConfigStatus> {
  const homeConfig = path.join(os.homedir(), ".codex", "config.toml");
  const workspaceConfig = path.join(workspace, ".codex", "config.toml");
  return {
    agent: "codex",
    homeConfig,
    workspaceConfig,
    homeConfigExists: await pathExists(homeConfig),
    workspaceConfigExists: await pathExists(workspaceConfig),
  };
}

