import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

export function sha256Text(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256File(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

