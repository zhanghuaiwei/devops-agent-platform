<!-- AI 生成:hooks 目录说明与启用方式 -->
# .ai/hooks — 跨智能体共用自动化脚本

本目录是 hooks 脚本的唯一内容源,被 pre-commit 与各 AI 智能体共用:

| 脚本 | 类型 | 作用 | 触发时机 |
|------|------|------|----------|
| `boundary-check.sh` | 检查脚本 | 代码边界检查(mock 边界 / 绝对 URL / 硬编码密钥等) | 已被 `.pre-commit-config.yaml` 引用,提交时自动执行;也可手动 `bash .ai/hooks/boundary-check.sh` |
| `post-edit-lint.sh` | AI hook | AI 编辑文件后按类型自动 lint(eslint/ruff/spotless) | 需在各智能体的 hooks 设置中注册为 PostToolUse hook |

## 各智能体启用方式

**Claude Code**:已在 `.claude/settings.json` 中注册,开箱即用。

**其他智能体(WorkBuddy / Trae 等)**:在其 hooks 配置中添加等价条目:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "bash .ai/hooks/post-edit-lint.sh" }
        ]
      }
    ]
  }
}
```

> 说明:`boundary-check.sh` 不依赖任何智能体,随 pre-commit 开箱即用;`post-edit-lint.sh` 用于 AI 编程时的即时反馈闭环。
