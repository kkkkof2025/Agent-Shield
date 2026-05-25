export function isMcpConfigPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return normalized.includes("mcp") && (normalized.endsWith(".json") || normalized.endsWith(".toml"));
}

