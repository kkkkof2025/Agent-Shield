import { codexConfigStatus } from "../snapshot/agent-config-snapshot";

export async function inspectCodexConfig(workspace: string): Promise<string[]> {
  const status = await codexConfigStatus(workspace);
  return [
    `Home config: ${status.homeConfigExists ? "found" : "missing"} (${status.homeConfig})`,
    `Workspace config: ${status.workspaceConfigExists ? "found" : "missing"} (${status.workspaceConfig})`,
  ];
}

