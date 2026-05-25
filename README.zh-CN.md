# AgentShield Runtime

[English](README.md) | 简体中文

AgentShield Runtime 是一个本地 AI CLI 上层运行时，用来包装、管理和审计 Codex CLI、OpenClaw、Claude Code、Gemini CLI、Aider 等本地命令行 Agent。

它不是：

- 杀毒软件
- EDR
- 木马分析器
- 提权工具
- 绕过安全软件的工具
- 凭据提取工具

## 当前进展

Phase 1 已经实现并可用：

- `inventory`
- `check codex`
- `snapshot create`
- `snapshot diff`
- `run codex`
- `sessions`
- `resume --last`
- `report`
- `risks`

当前已经可用的能力：

- 通过 `npm link` 暴露本地 `agent-shield` 命令
- Windows 下兼容 Codex shim 启动
- 记录会话元数据
- 创建前后快照
- 生成 Markdown 报告
- 查询历史风险记录
- 自动更新 `.agent-shield/session-summary.md`

仍然是后续阶段的内容：

- Phase 2：Codex SDK Runtime
- Phase 3：多 Agent 适配器
- Phase 4：hooks / guardrails
- 真实交互式 `run codex` 和 `resume --last` 的完整 TTY 验证

详细待办见 [TODO.md](TODO.md)。

## 快速开始

```bash
cd agent-shield-runtime
npm install
npm run build
npm link
```

链接后直接使用：

```bash
agent-shield inventory
agent-shield check codex
agent-shield run codex
agent-shield risks --last
```

如果你想直接运行编译产物，注意只写脚本路径，不要再加 `agent-shield`：

```bash
node .\dist\index.js inventory
node .\dist\index.js check codex
node .\dist\index.js run codex
```

不要写成：

```bash
node .\dist\index.js agent-shield run codex
```

## 命令说明

```bash
agent-shield inventory
agent-shield check codex
agent-shield check openclaw
agent-shield check claude
agent-shield run codex
agent-shield run --name custom -- <command>
agent-shield sessions
agent-shield resume --last
agent-shield snapshot create
agent-shield snapshot diff <before> <after>
agent-shield report --last
agent-shield memory show
agent-shield memory update
agent-shield risks
agent-shield risks --last
agent-shield risks --level high
agent-shield risks --json
agent-shield hooks install codex
agent-shield hooks remove codex
```

## 行为说明

`run codex` 的流程：

1. 检查 `codex` 是否安装。
2. 只检查配置文件是否存在，不读取凭据内容。
3. 创建 before snapshot。
4. 启动 Codex。
5. 创建 after snapshot。
6. 生成 canonical session。
7. 输出 Markdown 报告。
8. 更新 `.agent-shield/session-summary.md`。

`resume --last` 的流程：

1. 找到最近一条 AgentShield session。
2. 根据 session 和记忆文件重建恢复上下文。
3. 注入恢复提示词。
4. 以 Windows 兼容方式启动 Codex resume。

## 安全说明

- 不读取或记录 token、cookie、密码、私钥、证书私钥、浏览器凭据内容。
- 敏感路径只记录元数据。
- Phase 1 的 hooks 安装/移除仍是占位，不会修改用户配置。

## 查询历史风险记录

风险历史会写入 `data/` 下的 canonical session JSON 和 Markdown report。优先使用 CLI 查询：

```bash
agent-shield risks
agent-shield risks --last
agent-shield risks --level medium
agent-shield risks --level high
agent-shield risks --json
```

例子：如果某次被 AgentShield 管理的会话创建或修改了 `.ps1` 文件，可以查最近一次会话：

```bash
agent-shield risks --last
```

输出大致是：

```text
Risk records:
- MEDIUM | file-change | added: scripts/demo.ps1 | session=as_... | started=...
```

也可以生成或重新打开 Markdown 报告：

```bash
agent-shield report --last
```

重点看这些部分：

- `文件变化`
- `命令记录`
- `高风险事件`

如果你刚刚创建了 `ps1` 文件，但它不是在 `agent-shield run codex` 包装的会话中创建的，AgentShield 当前不会自动知道这次操作。需要先用 AgentShield 包装运行，或者用 snapshot 对比：

```bash
agent-shield snapshot create
# 做一些文件操作
agent-shield snapshot create
agent-shield snapshot diff <before> <after>
```

## 目录说明

- `src/`：TypeScript 实现
- `rules/`：基础策略文件
- `templates/`：恢复提示词和报告模板
- `data/`：本地会话、快照、报告和记忆产物
- `data/sessions/canonical/`：canonical session JSON 记录
- `data/reports/`：Markdown 会话报告
