<!-- AI 生成:.ai 目录总览 —— 本仓库 AI 工程化的唯一内容源(SSOT) -->
# .ai — AI 工程化内容源

本目录是所有 AI 智能体规约与能力的**唯一内容源**。各智能体只通过适配层(壳文件)引用这里的内容,**规则/能力正文禁止写在壳文件里**。

## 目录结构

```
.ai/
├── rules/        # 规则片段:project(版本红线)/ boundaries(代码边界)/ security(安全红线)
│                 #           workflow(工作流)/ conventions(规范·测试·提交)
├── skills/       # 能力定义(编写规范见 skills/README.md):每个能力一个目录,内含 SKILL.md
├── agents/       # subAgent 提示词正文:code-reviewer / security-reviewer / test-writer
└── hooks/        # 自动化脚本:boundary-check.sh(pre-commit 用)/ post-edit-lint.sh(AI hook 用)
```

## 适配层(壳,只引用本目录,勿写正文)

| 智能体 | 入口 |
|--------|------|
| Claude Code | `CLAUDE.md`(@ 导入 rules)+ `.claude/agents/` + `.claude/commands/` + `.claude/settings.json` |
| Codex | `AGENTS.md` |
| Trae | `.trae/rules/project_rules.md` |
| WorkBuddy | `CODEBUDDY.md` |

## 维护约定

1. **改规则/能力 → 只改本目录**,适配层壳不动;新增能力才需要在壳层加一行引用
2. 所有文件头部带 `AI 生成` 标注,并注明"内容源/适配层"身份
3. 引用用**仓库相对路径**(如 `.ai/rules/boundaries.md`),不写绝对路径
4. 本目录自身的变更同样过 `pre-commit run --all-files` 与 code-reviewer 审查
