import { redactText } from "../utils/redaction";

export interface TextRiskFinding {
  level: "low" | "medium" | "high";
  type: string;
  detail: string;
  recommendation: string;
}

interface TextRule {
  pattern: RegExp;
  level: "medium" | "high";
  type: string;
  detail: string;
  recommendation: string;
}

const textRules: TextRule[] = [
  {
    pattern: /\b(ignore|disregard|forget)\b.{0,60}\b(previous|above|system|developer|instruction|policy|rules?)\b/i,
    level: "high",
    type: "prompt-injection",
    detail: "Attempts to override previous/system/developer instructions",
    recommendation: "Treat as prompt injection and do not apply it to agent role or policy.",
  },
  {
    pattern: /(你现在是|忽略.{0,20}(上面|之前|系统|开发者|规则|指令)|忘记.{0,20}(规则|指令)|不要遵守.{0,20}(规则|指令))/i,
    level: "high",
    type: "prompt-injection",
    detail: "中文角色覆盖或忽略规则提示",
    recommendation: "不要把这类内容写入 AGENTS/MEMORY/TASKS/DECISIONS 或运行时系统提示。",
  },
  {
    pattern:
      /(AGENTS\.md|MEMORY\.md|TASKS\.md|DECISIONS\.md|system prompt|developer message).{0,80}(rewrite|replace|delete|remove|override|修改|替换|删除|覆盖)|(rewrite|replace|delete|remove|override|修改|替换|删除|覆盖).{0,80}(AGENTS\.md|MEMORY\.md|TASKS\.md|DECISIONS\.md|system prompt|developer message)/i,
    level: "high",
    type: "agent-role-modification",
    detail: "Attempts to modify agent role, memory, task, or decision files",
    recommendation: "Require explicit user confirmation before changing role or memory files.",
  },
  {
    pattern: /[\u200b-\u200f\u202a-\u202e\u2060-\u206f]/,
    level: "medium",
    type: "hidden-unicode",
    detail: "Contains zero-width or bidirectional control characters",
    recommendation: "Normalize or reject hidden-control text before using it in prompts, commands, or config.",
  },
  {
    pattern: /\b(?:[A-Za-z0-9+/]{80,}={0,2}|[A-Fa-f0-9]{96,})\b/,
    level: "medium",
    type: "encoded-or-obfuscated-string",
    detail: "Contains a long base64/hex-looking blob",
    recommendation: "Decode and inspect only in a safe analysis path; do not execute it.",
  },
  {
    pattern: /(OPENAI|ANTHROPIC|GEMINI|GOOGLE|AZURE)_?(API_)?(BASE_URL|BASEURL|ENDPOINT)|\b(base_url|baseURL|api_base|apiBase)\b/i,
    level: "medium",
    type: "ai-api-endpoint-change",
    detail: "Changes or references an AI API endpoint/base URL",
    recommendation: "Verify the endpoint owner and policy before routing prompts, code, or files through it.",
  },
  {
    pattern: /(中转站|公益中转|API\s*代理|API\s*relay|one-api|new-api|openai-sb|低价\s*token|token\s*转卖|APImaxxing|模型替换|token\s*虚耗)/i,
    level: "high",
    type: "ai-api-relay-abuse",
    detail: "References AI API relay, token resale, model substitution, or token-draining patterns",
    recommendation: "Do not send sensitive prompts, code, files, or credentials through untrusted relay services.",
  },
  {
    pattern: /(读取|上传|发送|导出|exfil|post|upload|send).{0,80}(\.ssh|auth\.json|cookie|cookies|token|api[_-]?key|private[_-]?key|浏览器凭据)/i,
    level: "high",
    type: "credential-exfiltration",
    detail: "Requests reading or sending sensitive credentials or browser data",
    recommendation: "Block the action and record metadata only.",
  },
  {
    pattern: /(mcp).{0,80}(server|stdio|command|url|unknown|未知|新增|修改)/i,
    level: "medium",
    type: "mcp-config-change",
    detail: "References MCP server/config changes",
    recommendation: "Review MCP server command, URL, and trust boundary before enabling.",
  },
];

export function classifyTextRisks(text: string): TextRiskFinding[] {
  const redacted = redactText(text);
  const findings: TextRiskFinding[] = [];
  for (const rule of textRules) {
    if (rule.pattern.test(redacted)) {
      findings.push({
        level: rule.level,
        type: rule.type,
        detail: rule.detail,
        recommendation: rule.recommendation,
      });
    }
  }
  return dedupeFindings(findings);
}

function dedupeFindings(findings: TextRiskFinding[]): TextRiskFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.level}|${finding.type}|${finding.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
