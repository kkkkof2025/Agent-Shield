import { createProjectSnapshot } from "../snapshot/project-snapshot";
import { diffSnapshots } from "../snapshot/snapshot-diff";

export async function createSnapshot(workspace: string): Promise<string> {
  const snapshot = await createProjectSnapshot(workspace);
  return `Created snapshot: ${snapshot.id}`;
}

export async function showSnapshotDiff(before: string, after: string): Promise<string> {
  const diff = await diffSnapshots(before, after);
  const lines = [`Snapshot diff: ${diff.before} -> ${diff.after}`];
  for (const change of [...diff.added, ...diff.modified, ...diff.deleted]) {
    lines.push(`${change.type.padEnd(8)} ${change.risk.padEnd(6)} ${change.file}`);
  }
  if (lines.length === 1) lines.push("No file changes detected.");
  return lines.join("\n");
}

