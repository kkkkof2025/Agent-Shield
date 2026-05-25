import path from "node:path";
import { runtimeRoot } from "../utils/fs-safe";

export function codexHooksTemplateDir(): string {
  return path.join(runtimeRoot(), "templates", "codex-hooks");
}

