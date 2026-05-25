import { spawn } from "node:child_process";

export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

export function runCapture(command: string, args: string[], cwd: string, timeoutMs = 5000): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawnPortable(command, args, cwd, ["ignore", "pipe", "pipe"]);
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      resolve({ code: 124, stdout, stderr: `${stderr}\nCommand timed out`.trim() });
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export function spawnPassthroughPortable(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawnPortable(command, args, cwd, "inherit");
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

export function spawnWithInputPortable(command: string, args: string[], input: string, cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawnPortable(command, args, cwd, ["pipe", "inherit", "inherit"]);
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
    child.stdin?.write(input);
    child.stdin?.end();
  });
}

function spawnPortable(
  command: string,
  args: string[],
  cwd: string,
  stdio: "inherit" | ["ignore" | "pipe", "pipe" | "inherit", "pipe" | "inherit"] | ["pipe", "inherit", "inherit"],
) {
  if (process.platform === "win32") {
    return spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", buildWindowsCommand(command, args)], {
      cwd,
      stdio,
      windowsVerbatimArguments: false,
    });
  }
  return spawn(command, args, { cwd, stdio, shell: false });
}

function buildWindowsCommand(command: string, args: string[]): string {
  return [quoteWindowsExecutable(command), ...args.map(quoteWindowsCmdArg)].join(" ");
}

function quoteWindowsExecutable(value: string): string {
  if (/^[A-Za-z0-9_.-]+$/.test(value)) return value;
  return quoteWindowsCmdArg(value);
}

function quoteWindowsCmdArg(value: string): string {
  if (value.length === 0) return '""';
  if (/^[A-Za-z0-9_.:/=+-]+$/.test(value)) return value;
  const escaped = value.replace(/(["^&|<>()%])/g, "^$1");
  return `"${escaped}"`;
}
