const SECRET_VALUE_PATTERN =
  /(api[_-]?key|token|cookie|password|passwd|secret|private[_-]?key)\s*[:=]\s*([^\s'"`]+)/gi;

const SENSITIVE_PATH_PARTS = [
  ".ssh",
  "auth.json",
  "cookie",
  "cookies",
  "login data",
  "keychain",
  "id_rsa",
  "id_ed25519",
  ".p12",
  ".pfx",
  ".pem",
  ".key",
  ".env",
];

export function redactText(value: string): string {
  return value.replace(SECRET_VALUE_PATTERN, "$1=<redacted>");
}

export function isSensitivePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return SENSITIVE_PATH_PARTS.some((part) => normalized.includes(part));
}

export function safePathLabel(filePath: string): string {
  return isSensitivePath(filePath) ? `${filePath} (sensitive metadata only)` : filePath;
}

