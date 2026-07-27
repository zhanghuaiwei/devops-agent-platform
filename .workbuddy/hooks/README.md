<!-- AI 生成:hooks 目录说明与启用方式 -->
# WorkBuddy Hooks

本目录提供两类自动化脚本:

| 脚本 | 类型 | 作用 | 触发时机 |
|------|------|------|----------|
| `boundary-check.sh` | 检查脚本 | 代码边界检查(mock 边界 / 绝对 URL / 硬编码密钥等) | 已被 `.pre-commit-config.yaml` 引用,提交时自动执行;也可手动 `bash .workbuddy/hooks/boundary-check.sh` |
| `post-edit-lint.sh` | WorkBuddy hook | AI 编辑文件后按类型自动 lint(eslint/ruff/spotless) | 需在 WorkBuddy 设置中注册为 PostToolUse hook |

## 启用 PostToolUse hook(可选)

在 WorkBuddy 设置的 hooks 配置中添加:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "bash .workbuddy/hooks/post-edit-lint.sh" }
        ]
      }
    ]
  }
}
```

> 说明:`boundary-check.sh` 不依赖 WorkBuddy,随 pre-commit 开箱即用;`post-edit-lint.sh` 用于 AI 编程时的即时反馈闭环。
