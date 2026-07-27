---
# AI 生成:Claude Code subAgent(适配层壳)—— 提示词内容源:.ai/agents/test-writer.md
name: test-writer
description: 新功能代码完成后调用,按本仓库测试规约补齐单元测试与边界用例。可写测试文件,不改业务代码。
tools: Read, Write, Edit, Grep, Glob, Bash
---

开始补测试前,先阅读 `.ai/agents/test-writer.md` 并严格按其中的测试规约、用例类型与输出约定执行。
