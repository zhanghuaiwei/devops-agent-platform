<!-- 本文由 AI 生成,是 WorkBuddy 在本仓库工作时的专属协作规约(适配层);规则与能力的唯一内容源在 .ai/ -->
# CODEBUDDY.md — WorkBuddy 项目协作规约

> 通用规约入口见 `AGENTS.md`(Codex 兼容);规则正文在 `.ai/rules/`,能力正文在 `.ai/skills/` 与 `.ai/agents/`。

## 1. 工作模式

- **默认 Craft 模式**,但涉及 `server/`、`agent-engine/` 中带 `TODO(学习者)` 标记的骨架文件时,切换为"只讲解、不代写",除非用户明确说"帮我实现"(细则:`.ai/rules/workflow.md`)
- 本项目的学习者(用户)正在手写 server 与 agent-engine:AI 的输出应以**教程、评审、答疑**为主,而非直接产出实现

## 2. 本仓库已装载的能力(内容源在 `.ai/`)

| 能力 | 位置 | 用途 |
|------|------|------|
| 规则 | `.ai/rules/` | 版本红线 / 代码边界 / 安全红线 / 工作流 / 规范与测试 |
| Skills | `.ai/skills/` | 提交规范检查、代码审查清单、API 契约检查 |
| subAgent 提示词 | `.ai/agents/` | code-reviewer / security-reviewer / test-writer |
| Hooks | `.ai/hooks/` | 编辑后自动 lint、提交前边界检查(启用方式见该目录 README) |

## 3. 交互约定

1. **询问优先**:完善 server/agent-engine 骨架或新增 web 功能前,先确认:属于哪个功能点(F1.x)?是否触及学习者的 TODO 区域?
2. **中文回复**,代码注释用中文;提交信息用英文 type + 中文描述亦可
3. **交付即注释**:所有生成内容带"AI 生成"标注与学习向注释
4. **记忆**:里程碑式决策(如选型变更)写入项目记忆,便于跨会话延续

## 4. 快速验证命令

```bash
cd web && pnpm lint && pnpm build            # Web 端质量门(先 nvm use 对齐 Node 版本)
pre-commit run --all-files                    # 全仓提交前检查(含 .ai/hooks/boundary-check.sh)
```
