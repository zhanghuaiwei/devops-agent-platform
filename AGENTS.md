<!-- 本文由 AI 生成,定义任意 AI Agent(Claude / CodeBuddy / Cursor 等)在本仓库的协作规约 -->
# AGENTS.md — AI Agent 协作规约

> 任何 AI 编程 Agent 在本仓库工作前,先读本文件,再读 `CLAUDE.md` 的版本红线与代码边界。

## 1. 角色分工(本仓库配置的 subAgent)

| subAgent | 文件 | 职责 | 何时调用 |
|----------|------|------|----------|
| 代码审查员 | `.workbuddy/agents/code-reviewer.md` | 按严重级别审查变更:安全 > 边界 > 规范 > 性能 | 完成一个功能后、提交 PR 前 |
| 安全审查员 | `.workbuddy/agents/security-reviewer.md` | 专查:硬编码密钥、注入、XSS、越权、依赖漏洞 | 涉及认证/输入处理/新增依赖时 |
| 测试工程师 | `.workbuddy/agents/test-writer.md` | 为新代码补齐单元测试与边界用例 | 新功能代码完成后 |

## 2. 工作流规约(vibe coding 范式)

1. **先问后写**:需求模糊时,先列 2~4 个方案让用户选,不要猜
2. **小步提交**:一次只做一件事;单文件改动超过 ~300 行先拆任务
3. **注释义务**:AI 生成的每个文件头部注明 `AI 生成`;关键决策处写清"为什么"
4. **骨架与实施分离**:`server/` 与 `agent-engine/` 中的 `TODO(学习者)` 标记处是留给人类学习者手写的,AI 不得擅自补全,除非用户明确要求
5. **禁止越界**:不得修改对方端口的内部实现(如让 web 组件直连数据库);跨端问题走接口契约(`docs/architecture.md` 的 API 契约表)

## 3. 提交规范(Conventional Commits)

```
<type>(<scope>): <subject>

type: feat | fix | docs | style | refactor | test | chore | perf | security
scope: web | server | agent | devops | docs | engineering
示例: feat(web): 新增 Pipeline 失败率趋势图
```

- 提交前必须过 `pre-commit run --all-files`
- PR 必须填写 `.github/pull_request_template.md` 的检查清单

## 4. 代码所有权与边界地图

```
web/src/mocks/**        → 唯一允许写 mock 数据的位置
server/**/common/**     → 三端共享逻辑唯一出口,改动需双人确认
agent-engine/app/tools/ → 每个 Tool 一个文件,description 即 Agent 的"使用说明书",改它会影响 Agent 行为,需回归测试
devops/**               → 基础设施即代码,任何端口/密码改动同步更新 docs/devops-guide
```

## 5. 升级与依赖

- 升级任何"版本红线"内的依赖,必须先在 PR 描述中写明:动机 / 破坏性变更评估 / 回滚方案
- 引入新依赖前先查维护活跃度(最近 6 个月有提交)、许可证(禁 GPL)、包体积
