import path from "node:path";
import { readJsonIfExists, runtimeDataDir } from "../utils/fs-safe";
import { evaluateFileChange } from "../safety/policy-engine";
import { FileChange } from "../session/canonical-session";
import { ProjectSnapshot } from "./project-snapshot";

export interface SnapshotDiff {
  before: string;
  after: string;
  added: FileChange[];
  modified: FileChange[];
  deleted: FileChange[];
}

export async function diffSnapshots(beforeRef: string, afterRef: string): Promise<SnapshotDiff> {
  const beforePath = resolveSnapshotRef(beforeRef);
  const afterPath = resolveSnapshotRef(afterRef);
  const before = await readJsonIfExists<ProjectSnapshot>(beforePath);
  const after = await readJsonIfExists<ProjectSnapshot>(afterPath);
  if (!before) throw new Error(`Snapshot not found: ${beforeRef}`);
  if (!after) throw new Error(`Snapshot not found: ${afterRef}`);

  const beforeFiles = new Map(before.files.map((file) => [file.path, file]));
  const afterFiles = new Map(after.files.map((file) => [file.path, file]));
  const added: FileChange[] = [];
  const modified: FileChange[] = [];
  const deleted: FileChange[] = [];

  for (const [file, afterItem] of afterFiles) {
    const beforeItem = beforeFiles.get(file);
    if (!beforeItem) {
      added.push({ type: "added", file, risk: evaluateFileChange(file) });
      continue;
    }
    const hashChanged = beforeItem.sha256 && afterItem.sha256 && beforeItem.sha256 !== afterItem.sha256;
    const metadataChanged =
      (!beforeItem.sha256 || !afterItem.sha256) &&
      (beforeItem.size !== afterItem.size || Math.round(beforeItem.mtimeMs) !== Math.round(afterItem.mtimeMs));
    if (hashChanged || metadataChanged) {
      modified.push({ type: "modified", file, risk: evaluateFileChange(file) });
    }
  }

  for (const file of beforeFiles.keys()) {
    if (!afterFiles.has(file)) {
      deleted.push({ type: "deleted", file, risk: evaluateFileChange(file) });
    }
  }

  return { before: before.id, after: after.id, added, modified, deleted };
}

function resolveSnapshotRef(ref: string): string {
  if (path.isAbsolute(ref) || ref.includes(path.sep)) return ref;
  const name = ref.endsWith(".json") ? ref : `${ref}.json`;
  return path.join(runtimeDataDir(), "snapshots", name);
}

