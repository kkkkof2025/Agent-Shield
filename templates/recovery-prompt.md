# AgentShield 会话恢复上下文

你正在恢复一个被 AgentShield 管理的本地 AI 开发会话。

## 原始目标
{{originalGoal}}

## 当前状态
{{currentState}}

## 已完成
{{completed}}

## 修改过的文件
{{changedFiles}}

## 关键决策
{{decisions}}

## 阻塞点
{{blockers}}

## 下一步
{{nextSteps}}

## 安全边界
本次恢复必须遵守：

{{safetyBoundaries}}

禁止读取或输出 token、cookie、密码、私钥、证书私钥、浏览器凭据、.ssh 私钥内容。
禁止修改 Startup、Run/RunOnce、计划任务、PowerShell Profile，除非用户明确要求并二次确认。
禁止使用 danger-full-access。
优先使用 workspace-write 和 on-request。
修改代码前先说明计划。
只做与当前任务相关的最小修改。

