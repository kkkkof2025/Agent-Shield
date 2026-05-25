import { isSensitivePath } from "../utils/redaction";

export function shouldReadFileContent(filePath: string, size: number): boolean {
  if (isSensitivePath(filePath)) return false;
  return size <= 10 * 1024 * 1024;
}

