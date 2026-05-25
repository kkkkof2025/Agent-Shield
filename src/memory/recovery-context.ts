export interface RecoveryContext {
  originalGoal: string;
  currentState: string;
  completed: string[];
  changedFiles: string[];
  decisions: string[];
  blockers: string[];
  nextSteps: string[];
  safetyBoundaries: string[];
  providerResumeCommand?: string;
}

export function renderRecoveryPrompt(context: RecoveryContext): string {
  return `# AgentShield 会话恢复上下文

你正在恢复一个被 AgentShield 管理的本地 AI 开发会话。

## 原始目标
${context.originalGoal || "未记录"}

## 当前状态
${context.currentState || "未记录"}

## 已完成
${renderList(context.completed)}

## 修改过的文件
${renderList(context.changedFiles)}

## 关键决策
${renderList(context.decisions)}

## 阻塞点
${renderList(context.blockers)}

## 下一步
${renderList(context.nextSteps)}

## 安全边界
本次恢复必须遵守：

${renderList(context.safetyBoundaries)}

禁止读取或输出 token、cookie、密码、私钥、证书私钥、浏览器凭据、.ssh 私钥内容。
禁止修改 Startup、Run/RunOnce、计划任务、PowerShell Profile，除非用户明确要求并二次确认。
禁止使用 danger-full-access。
优先使用 workspace-write 和 on-request。
修改代码前先说明计划。
只做与当前任务相关的最小修改。
`;
}

function renderList(values: string[]): string {
  return values.length === 0 ? "- 未记录" : values.map((value) => `- ${value}`).join("\n");
}

