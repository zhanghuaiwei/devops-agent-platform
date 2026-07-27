<!-- AI 生成:项目架构总览与 ADR(架构决策记录),三端共同的权威契约文档 -->
# 架构设计与 ADR

## 1. 总体架构

```
┌──────────────┐   HTTP/WS   ┌──────────────┐   HTTP(内部)  ┌──────────────┐
│  web         │ ──────────▶ │  server      │ ────────────▶ │ agent-engine │
│  Next.js 14  │             │ Spring Boot  │               │ FastAPI+LC   │
└──────────────┘             └──────┬───────┘               └──────────────┘
                                    │
                    PostgreSQL 16 / Redis 7.2 / MinIO(Docker Compose)
```

- **web**:Next.js 14(App Router 承载 /chat、/login、/review;Pages Router 承载 /dashboard、/pipeline,刻意混合以学习双路由体系)
- **server**:Spring Boot 3.3 单体 + Maven 多模块(`devops-server` 主应用 + `devops-tool-spring-boot-starter` 自定义 Starter)
- **agent-engine**:FastAPI + LangChain ReAct Agent,SSE 流式输出

## 2. API 契约表(跨端唯一权威来源,变更必须三方同步)

| 调用方 → 提供方 | 端点 | 说明 | 关键字段 |
|---|---|---|---|
| web → server | `POST /api/auth/register` | 注册 | email, password → { accessToken, refreshToken, role } |
| web → server | `POST /api/auth/login` | 登录(限流 10次/5min/IP) | 同上 |
| web → server | `POST /api/auth/refresh` | 无感刷新 | refreshToken → { accessToken } |
| web → server | `WS /ws/chat` | 对话主通道 | 见 §3 消息协议 |
| web → server | `GET /api/chat/sessions` | 会话列表(分页) | page, size → { items, total } |
| web → server | `GET /api/monitor/jvm` | JVM 指标 | heap, gc, threads |
| web → server | `GET /api/monitor/system` | 系统指标 | cpu, memory |
| web → server | `GET /api/monitor/agents` | Agent 调用统计 | name, calls, avgMs, successRate |
| web → server | `GET /api/pipeline/runs` | 最近构建 | id, status, jobs[], startedAt |
| web → server | `POST /api/pipeline/runs/{id}/rerun` | 触发重跑 | → 202 |
| web → server | `GET /api/review/history` | 审查历史 | prUrl, verdict, createdAt |
| server → agent-engine | `POST /api/agent/chat` | SSE 流式主对话 | sessionId, message → 事件流 |
| server → agent-engine | `POST /api/agent/code-review` | 代码审查 | prUrl → ReviewReport |
| server → agent-engine | `POST /api/agent/deploy` | 部署检查 | serviceName → DeployVerdict |
| server → agent-engine | `POST /api/agent/diagnose` | 故障诊断 | serviceName?, timeRange → Diagnosis |

## 3. WebSocket / SSE 消息协议(F1.2 思考过程可视化)

Agent 推理步骤统一为如下事件(WS 与 SSE 同构):

```json
{ "type": "thought|action|observation|token|final|error",
  "agent": "code_review|deploy|diagnose|general",
  "payload": { },
  "seq": 1 }
```

- `action` 事件的 payload 固定为 `{ "tool": "...", "input": {...} }`
- `observation` 事件的 payload 固定为 `{ "tool": "...", "output": "..." }`
- `token` 用于最终回答的逐字流式渲染

## 4. ADR(架构决策记录)

| # | 决策 | 选择 | 理由 | 放弃 |
|---|------|------|------|------|
| ADR-1 | 后端架构 | 单体 | 功能边界清晰、内部工具、1 人团队;项目三再拆微服务 | 微服务 |
| ADR-2 | Java↔Python 通信 | HTTP REST | 独立部署扩展;FastAPI 天然异步;可替换引擎 | JNI/Py4J |
| ADR-3 | 实时推送 | WebSocket | 需双向通信(用户消息 + Agent 步骤推送) | SSE / 轮询 |
| ADR-4 | 前端数据层 | SWR | 数据量小、轻量;项目二升级 TanStack Query | TanStack Query |
| ADR-5 | 前端路由 | App + Pages 混合 | Chat 用 App Router,Dashboard/Pipeline 用 Pages Router 降低学习成本 | 纯 App Router |
| ADR-6 | Web mock | API Routes + mock 数据层 | 页面走真实路由,后端就绪只改 baseURL | MSW / 静态直引 |

## 5. 数据模型概要(server 所有,PostgreSQL)

`users(id, email, password_hash, role, created_at)` /
`chat_sessions(id, user_id, title, archived, created_at)` /
`chat_messages(id, session_id, role, agent, content, events_json, created_at)` /
`review_reports(id, pr_url, verdict, issues_json, created_at)`

> 详细 DDL 由学习者在 `docs/server-guide/05-MyBatisPlus与数据库.md` 实施时编写。
