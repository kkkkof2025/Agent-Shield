import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AgentCheckResult } from "./agent-adapter";
import { Provider } from "../session/canonical-session";

const execFileAsync = promisify(execFile);

export async function commandExists(command: string): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      await execFileAsync("where.exe", [command]);
    } else {
      await execFileAsync("which", [command]);
    }
    return true;
  } catch {
    return false;
  }
}

export async function getCommandVersion(command: string, args = ["--version"]): Promise<string | undefined> {
  try {
    if (process.platform === "win32") {
      const result = await execFileAsync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", buildWindowsVersionCommand(command, args)], { timeout: 7000 });
      return (result.stdout || result.stderr).trim().split(/\r?\n/)[0];
    }
    const result = await execFileAsync(command, args, { timeout: 7000 });
    return (result.stdout || result.stderr).trim().split(/\r?\n/)[0];
  } catch {
    return undefined;
  }
}

function buildWindowsVersionCommand(command: string, args: string[]): string {
  return [quoteWindowsExecutable(command), ...args.map(quoteWindowsArg)].join(" ");
}

function quoteWindowsExecutable(value: string): string {
  if (/^[A-Za-z0-9_.-]+$/.test(value)) return value;
  return quoteWindowsArg(value);
}

function quoteWindowsArg(value: string): string {
  if (value.length === 0) return '""';
  if (/^[A-Za-z0-9_.:/=+-]+$/.test(value)) return value;
  return `"${value.replace(/(["^&|<>()%])/g, "^$1")}"`;
}

export async function checkGeneric(provider: Provider, command: string): Promise<AgentCheckResult> {
  const installed = await commandExists(command);
  const version = installed ? await getCommandVersion(command) : undefined;
  return {
    provider,
    installed,
    command,
    version,
    notes: installed ? [] : [`${command} was not found on PATH.`],
  };
}
