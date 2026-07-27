<!-- AI 生成:Trae IDE 项目规则入口(适配层);规则与能力的唯一内容源在 .ai/,本文件只保留关键提醒与引用 -->
# DevOps Agent 平台 — Trae 项目规则

> 开始工作前,依次阅读 `.ai/rules/` 内容源:
> `project.md`(版本红线)→ `boundaries.md`(代码边界)→ `security.md`(安全红线)→ `workflow.md`(工作流)→ `conventions.md`(规范/测试/提交)

## 关键提醒(详细规则以上述内容源为准)

1. **学习者项目**:`server/`、`agent-engine/` 中带 `TODO(学习者)` 的骨架文件只讲解、不代写,除非用户明确要求
2. **先问后写**:需求模糊先列 2~4 个方案;新增功能前确认功能点(F1.x)与是否触及 TODO 区域
3. **边界红线**:web 只走 `/api/**`;server 只走 agent-engine 的 4 个契约端点;mock 只在 `web/src/mocks/`;密钥只走环境变量
4. **交付即注释**:文件头标注 `AI 生成`,关键逻辑写"为什么";中文回复、中文注释
5. **提交**:`<type>(<scope>): <subject>`,提交前过 `pre-commit run --all-files`

## 可用能力(内容源在 `.ai/`)

| 能力 | 引用方式 |
|------|----------|
| 代码审查(P0~P3) | 读 `.ai/agents/code-reviewer.md` + `.ai/skills/code-review-checklist/SKILL.md` |
| 安全审查 | 读 `.ai/agents/security-reviewer.md` |
| 测试补全 | 读 `.ai/agents/test-writer.md` |
| 提交规范 | 读 `.ai/skills/commit-convention/SKILL.md` |
| API 契约检查 | 读 `.ai/skills/api-contract-check/SKILL.md` |
| 边界检查脚本 | `bash .ai/hooks/boundary-check.sh` |
