export function pathEntries(): string[] {
  return (process.env.PATH || "").split(process.platform === "win32" ? ";" : ":").filter(Boolean);
}

