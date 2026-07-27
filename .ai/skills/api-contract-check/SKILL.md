---
# AI 生成:Skill 内容源 —— 跨端 API 契约一致性检查。适配层:.claude/commands/api-contract.md(各智能体入口只引用本文件)
name: api-contract-check
description: 检查 web/server/agent-engine 三端接口调用是否与 docs/architecture.md 的 API 契约一致。当用户新增/修改跨端接口时使用。
---

# API Contract Check Skill

## 契约表(唯一权威来源:docs/architecture.md)

| 调用方 → 提供方 | 端点 | 说明 |
|---|---|---|
| web → server | `POST /api/auth/login\|register\|refresh` | JWT 认证 |
| web → server | `WS /ws/chat` | 对话(双向,Agent 步骤推送) |
| web → server | `GET /api/monitor/**` | JVM/系统指标 |
| web → server | `GET /api/pipeline/**` / `POST /api/pipeline/{id}/rerun` | Pipeline |
| server → agent-engine | `POST /api/agent/chat` | SSE 流式主对话 |
| server → agent-engine | `POST /api/agent/code-review` | 代码审查 |
| server → agent-engine | `POST /api/agent/deploy` | 部署检查 |
| server → agent-engine | `POST /api/agent/diagnose` | 故障诊断 |

## 检查步骤

1. 找出变更中所有跨端调用(fetch / RestClient / httpx)
2. 对照契约表:端点路径、方法、请求/响应字段是否一致
3. 若变更了契约:提醒必须同步更新 `docs/architecture.md` 契约表 + 对端调用方
4. mock 模式下:检查 `web/src/mocks/` 返回结构是否与契约字段一致
