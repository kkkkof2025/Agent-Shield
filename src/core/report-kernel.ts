import path from "node:path";
import { CanonicalSession } from "../session/canonical-session";
import { runtimeDataDir, timestampForFile, writeText } from "../utils/fs-safe";

export async function writeSessionReport(session: CanonicalSession): Promise<string> {
  const ended = session.endedAt ? new Date(session.endedAt) : new Date();
  const filePath = path.join(runtimeDataDir(), "reports", `${timestampForFile(ended)}_${session.provider}_report.md`);
  await writeText(filePath, renderSessionReport(session));
  return filePath;
}

export function renderSessionReport(session: CanonicalSession): string {
  const fileRows = session.fileChanges
    .map((change) => `| ${change.type} | ${change.file} | ${change.risk} |`)
    .join("\n");
  const commandRows = session.commands
    .map((command) => `| ${command.command.replace(/\|/g, "\\|")} | ${command.exitCode ?? ""} | ${command.risk} |`)
    .join("\n");
  const riskRows = session.risks
    .map((risk) => `| ${risk.level} | ${risk.type} | ${risk.detail.replace(/\|/g, "\\|")} | ${risk.recommendation} |`)
    .join("\n");

  return `# AgentShield 会话报告

## 会话信息
- AgentShield Session ID: ${session.id}
- Provider: ${session.provider}
- Provider Session ID: ${session.providerSessionId || "未记录"}
- Workspace: ${session.workspace}
- Started: ${session.startedAt}
- Ended: ${session.endedAt || "未记录"}
- Status: ${session.status}

## 用户目标
${session.goal || "未记录"}

## 本次完成
${session.summary || "已完成一次 AgentShield 管理的 CLI 会话。"}

## 文件变化
| 类型 | 文件 | 风险 |
|---|---|---|
${fileRows || "| - | 无 | low |"}

## 命令记录
| 命令 | 退出码 | 风险 |
|---|---|---|
${commandRows || "| - | - | low |"}

## 配置变化
- Codex: 仅记录配置文件存在性和路径元数据，不读取认证内容。
- OpenClaw: 未检测。
- Claude: 未检测。
- MCP: 未检测未知 server 详情。

## 持久化位置变化
- Startup: 未修改。
- Run/RunOnce: 未修改。
- Scheduled Tasks: 未修改。
- PowerShell Profile: 未修改。

## 高风险事件
| 等级 | 类型 | 详情 | 建议 |
|---|---|---|---|
${riskRows || "| - | 无 | 未发现高风险事件 | 继续保持最小权限运行 |"}

## 恢复建议
下一次可以执行：

\`\`\`bash
agent-shield resume ${session.id}
\`\`\`

## 下一步
${session.nextSteps.length ? session.nextSteps.map((step) => `- ${step}`).join("\n") : "- 继续查看报告和快照差异。"}
`;
}

