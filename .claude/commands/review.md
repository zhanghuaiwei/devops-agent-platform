---
# AI 生成:Claude Code 斜杠命令 /review(适配层壳)—— 清单内容源:.ai/skills/code-review-checklist/SKILL.md
description: 按本仓库四级严重度审查代码变更(P0安全 > P1边界 > P2规范 > P3性能)
argument-hint: [文件范围或留空审查 git diff]
---

先阅读 `.ai/skills/code-review-checklist/SKILL.md`,严格按其中 P0→P3 清单逐项检查,并按"严重级别 / 文件:行号 / 问题 / 修复建议"格式输出,末尾给出结论(通过 / 修复 P0/P1 后通过 / 不通过)。

审查范围:$ARGUMENTS(留空则用 `git diff` 确定变更集)
