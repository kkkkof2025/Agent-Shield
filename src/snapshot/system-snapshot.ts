export interface SystemInventory {
  platform: NodeJS.Platform;
  arch: string;
  node: string;
  cwd: string;
}

export function getSystemInventory(): SystemInventory {
  return {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    cwd: process.cwd(),
  };
}

