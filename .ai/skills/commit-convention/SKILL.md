---
# AI 生成:Skill 内容源 —— Conventional Commits 提交规范。适配层:.claude/commands/commit.md(各智能体入口只引用本文件)
name: commit-convention
description: 生成或校验符合本仓库 Conventional Commits 规约的提交信息。当用户要求"提交代码/写 commit/检查提交信息"时使用。
---

# Commit Convention Skill

## 格式

```
<type>(<scope>): <subject>
```

- **type**:`feat | fix | docs | style | refactor | test | chore | perf | security`
- **scope**:`web | server | agent | devops | docs | engineering`
- **subject**:祈使句、≤ 72 字符、不以句号结尾

## 规则

1. 一次提交只做一件事;混杂改动先拆分
2. 提交前必须执行 `pre-commit run --all-files` 并通过
3. 破坏性变更在 footer 写 `BREAKING CHANGE: <说明>`
4. 示例:
   - `feat(web): 新增 Pipeline 失败率趋势图`
   - `fix(server): 修复 refreshToken 并发刷新竞态`
   - `security(agent): 移除日志中的敏感参数打印`
