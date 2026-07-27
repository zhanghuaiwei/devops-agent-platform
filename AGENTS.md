<!-- 本文由 AI 生成,定义任意 AI Agent(Codex / Claude / Trae / WorkBuddy 等)在本仓库的协作规约;规则与能力的唯一内容源在 .ai/ -->
# AGENTS.md — AI Agent 协作规约

> 任何 AI 编程 Agent 在本仓库工作前,按顺序阅读 `.ai/rules/` 下的规则内容源:
>
> 1. `.ai/rules/project.md` — 项目快照与版本红线
> 2. `.ai/rules/boundaries.md` — 代码边界与所有权地图
> 3. `.ai/rules/security.md` — 安全红线
> 4. `.ai/rules/workflow.md` — 工作流规约(学习者 TODO 区域不得代写)
> 5. `.ai/rules/conventions.md` — 代码规范 / 测试要求 / 提交规范 / 常用命令

## 1. 角色分工(subAgent 提示词源在 `.ai/agents/`)

| subAgent | 内容源 | 职责 | 何时调用 |
|----------|--------|------|----------|
| 代码审查员 | `.ai/agents/code-reviewer.md` | 按严重级别审查变更:安全 > 边界 > 规范 > 性能 | 完成一个功能后、提交 PR 前 |
| 安全审查员 | `.ai/agents/security-reviewer.md` | 专查:硬编码密钥、注入、XSS、越权、依赖漏洞 | 涉及认证/输入处理/新增依赖时 |
| 测试工程师 | `.ai/agents/test-writer.md` | 为新代码补齐单元测试与边界用例 | 新功能代码完成后 |

## 2. 可用 Skill(内容源在 `.ai/skills/`)

| Skill | 内容源 | 用途 |
|-------|--------|------|
| 代码审查清单 | `.ai/skills/code-review-checklist/SKILL.md` | P0~P3 四级审查标准 |
| 提交规范 | `.ai/skills/commit-convention/SKILL.md` | Conventional Commits 生成与校验 |
| API 契约检查 | `.ai/skills/api-contract-check/SKILL.md` | 三端接口对照 `docs/architecture.md` 契约表 |
| 方案列举+举一反三 | `.ai/skills/option-presenter/SKILL.md` | 默认应答行为:列 2~4 方案供选择,结论后举一反三 |

> Skill 编写规范(拆分/引用/脚本)见 `.ai/skills/README.md`。

## 3. 自动化脚本(`.ai/hooks/`)

- 提交前边界检查:`bash .ai/hooks/boundary-check.sh`(已挂入 pre-commit)
- 编辑后自动 lint:`bash .ai/hooks/post-edit-lint.sh <file>`(注册方式见 `.ai/hooks/README.md`)

## 4. 各智能体入口(适配层,只引用 `.ai/`,不含规则正文)

| 智能体 | 入口 |
|--------|------|
| Claude Code | `CLAUDE.md`(@ 导入规则)+ `.claude/agents/` + `.claude/commands/` |
| Codex | 本文件(`AGENTS.md`) |
| Trae | `.trae/rules/project_rules.md` |
| WorkBuddy | `CODEBUDDY.md` |
