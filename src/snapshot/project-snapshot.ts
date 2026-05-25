import { promises as fs } from "node:fs";
import path from "node:path";
import { runtimeDataDir, timestampForFile, toPosix, writeJson } from "../utils/fs-safe";
import { sha256File } from "../utils/hashing";
import { isSensitivePath } from "../utils/redaction";
import { shouldReadFileContent } from "../safety/sensitive-file-guard";

export interface ProjectSnapshotFile {
  path: string;
  size: number;
  mtimeMs: number;
  sha256?: string;
  sensitive: boolean;
  unreadHashReason?: string;
}

export interface ProjectSnapshot {
  id: string;
  type: "project";
  workspace: string;
  createdAt: string;
  files: ProjectSnapshotFile[];
}

const DEFAULT_IGNORES = new Set([".git", "node_modules", "dist", ".agent-shield"]);

export async function createProjectSnapshot(workspace: string): Promise<ProjectSnapshot> {
  const createdAt = new Date();
  const snapshot: ProjectSnapshot = {
    id: `${timestampForFile(createdAt)}_project`,
    type: "project",
    workspace: path.resolve(workspace),
    createdAt: createdAt.toISOString(),
    files: await collectFiles(path.resolve(workspace)),
  };

  const filePath = snapshotPath(snapshot.id);
  await writeJson(filePath, snapshot);
  return snapshot;
}

export function snapshotPath(id: string): string {
  const name = id.endsWith(".json") ? id : `${id}.json`;
  return path.join(runtimeDataDir(), "snapshots", name);
}

async function collectFiles(root: string): Promise<ProjectSnapshotFile[]> {
  const output: ProjectSnapshotFile[] = [];
  await walk(root, root, output);
  return output.sort((a, b) => a.path.localeCompare(b.path));
}

async function walk(root: string, current: string, output: ProjectSnapshotFile[]): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(current, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (DEFAULT_IGNORES.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    const relative = toPosix(path.relative(root, absolute));
    if (relative.startsWith("data/snapshots/")) continue;
    if (entry.isDirectory()) {
      await walk(root, absolute, output);
      continue;
    }
    if (!entry.isFile()) continue;

    const stat = await fs.stat(absolute);
    const sensitive = isSensitivePath(relative);
    const item: ProjectSnapshotFile = {
      path: relative,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      sensitive,
    };

    if (shouldReadFileContent(relative, stat.size)) {
      item.sha256 = await sha256File(absolute);
    } else {
      item.unreadHashReason = sensitive ? "sensitive metadata only" : "file too large";
    }

    output.push(item);
  }
}

