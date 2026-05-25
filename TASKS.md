## 当前任务
- [ ] 任务名称：完善中文 README 命名和 TODO 入口
- [ ] 目标：将中文说明书改为 `README.zh-CN.md`，补充 `TODO.md` 路线图，并同步 GitHub。
- [ ] 当前状态：正在收尾提交。
- [ ] 已完成：重命名中文 README；新增 `TODO.md`；在英文和中文 README 中加入语言切换与 TODO 链接。
- [ ] 未完成：提交并推送本次文档调整。
- [ ] 阻塞点：无。
- [ ] 下一步：提交并 push 到远程仓库。

## 已完成任务

### 2026-05-25 Phase 1 Wrapper MVP

- 最终状态：完成。
- 已完成：inventory、check codex、snapshot create、snapshot diff、run codex、sessions、resume --last、Markdown report、`.agent-shield/session-summary.md` 自动更新逻辑。
- 验证：`npm run build`、`node dist/index.js inventory`、`node dist/index.js check codex`、`node dist/index.js sessions`、snapshot create/diff、`agent-shield inventory`、`agent-shield check codex`、`node dist/index.js agent-shield check codex`、`agent-shield run codex --version`。

### 2026-05-25 README 文档完善

- 最终状态：完成。
- 已完成：补充 `README.md` 的当前进展、快速开始、命令说明、行为流程和安全说明；新增中文 README，当前文件名为 `README.zh-CN.md`。
- 验证：静态文档更新。

### 2026-05-25 风险历史查询

- 最终状态：完成。
- 已完成：新增 `agent-shield risks`、`--last`、`--level`、`--json`；`.ps1/.psm1/.psd1` 文件变化标记为 medium 风险；补充中英文 README 查询示例。
- 验证：`npm run build`、`agent-shield risks`、`agent-shield risks --level medium`、`agent-shield risks --json`、`.ps1` 分类输出为 `medium`。

### 2026-05-25 GitHub 上传准备

- 最终状态：完成。
- 已完成：初始化 `agent-shield-runtime/` Git 仓库，补充 `.gitignore`，排除本地 `hello.ps1`，创建首个 commit `699a552`，配置 remote `https://github.com/kkkkof2025/Agent-Shield.git`，并推送最新 commit `3a880ad` 到 GitHub。
- 未完成：无。

### 2026-05-25 中文 README 命名和 TODO 入口

- 最终状态：进行中。
- 已完成：将中文说明书改为 `README.zh-CN.md`；新增 `TODO.md`；在双语 README 中加入语言切换和 TODO 链接。
- 未完成：提交并推送本次文档调整。
