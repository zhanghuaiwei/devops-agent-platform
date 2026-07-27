<!-- 本文由 AI 生成,作为项目入口说明;如有与实际代码出入,以代码为准 -->
<div align="center">

# DevOps Agent 智能运维平台

**用 AI Agent 自动化日常 DevOps 操作 —— 代码审查、部署检查、告警诊断、日志分析,一个聊天窗口搞定运维**

[![CI](https://github.com/zhanghuaiwei/devops-agent-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/zhanghuaiwei/devops-agent-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C)](https://www.langchain.com/)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Node](https://img.shields.io/badge/Node-22%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## ✨ 项目特性

- 🤖 **Agent 驱动的运维对话**:基于 LangChain ReAct Agent,支持 SSE 流式对话与 Agent 步骤实时推送
- 🔍 **四大运维场景**:代码审查 / 部署检查 / 故障诊断 / 监控指标,一个入口全覆盖
- 🏗️ **三端单体架构**:`Web → Spring Boot 单体 → Python Agent 引擎`,刻意选择单体而非微服务(见 [ADR](docs/architecture.md))
- 🎓 **学习友好**:`server/` 与 `agent-engine/` 为骨架代码 + 17 篇实施教程,由学习者亲手搭建
- 🛡️ **生产级工程化**:pre-commit + CI 五道流水线 + gitleaks 密钥扫描 + 代码边界自动检查
- 🧠 **AI 编程工程化**:`.ai/` 单一内容源(rules / skills / agents / hooks),适配 Claude Code / Codex / Trae / WorkBuddy

## 🏛️ 架构一览

```
┌─────────────┐   REST + WS    ┌──────────────┐   HTTP(4 契约端点)  ┌───────────────┐
│     web     │ ─────────────▶ │    server    │ ─────────────────▶ │ agent-engine  │
│  Next.js 14 │                │ Spring Boot  │                     │ FastAPI + LC  │
│  (mock 层)  │ ◀───────────── │   (Java 21)  │ ◀─────────────────  │  ReAct Agent  │
└─────────────┘   Agent 步骤推送 └──────┬───────┘    SSE 流式响应      └───────┬───────┘
                                        │                                     │
                                  PostgreSQL / Redis                    Docker / K8s
```

> 跨端接口以 [docs/architecture.md](docs/architecture.md) 的 API 契约表为唯一权威来源。

## 🧰 技术栈

| 端 | 技术 |
|----|------|
| Web | Next.js 14 · React 18 · TypeScript · Tailwind CSS · SWR · Vitest |
| Server | Java 21 · Spring Boot 3.3 · MyBatis-Plus · PostgreSQL 16 · Redis 7.2 |
| Agent Engine | Python 3.12 · FastAPI · LangChain 0.3 · pytest |
| DevOps | Docker Compose · Nginx · GitHub Actions · pre-commit · gitleaks |
| 包管理 | **pnpm 11**(Web,Node 版本用 nvm 对齐 `.nvmrc`)· Maven · pip |

## 🚀 快速开始

**前置要求**:[nvm](https://github.com/nvm-sh/nvm)、`corepack enable`(启用 pnpm)、Docker(可选)

```bash
# 1. 对齐 Node 版本(读取 .nvmrc → Node 22 LTS)
nvm use

# 2. Web 端:开箱即跑,内置 mock 数据层
cd web && pnpm install && pnpm dev        # http://localhost:3000

# 3. 服务端与 Agent 引擎:按 docs/ 下教程逐步实施(学习设计,由你亲手搭建)

# 4. 基础设施(待 server/agent-engine 就绪后)
cd devops && docker compose up -d         # PostgreSQL / Redis / MinIO
```

### Mock 账号(Web 端演示)

| 账号 | 密码 | 角色 |
|------|------|------|
| admin@devops.local | admin123 | ADMIN |
| dev@devops.local | dev123 | DEVELOPER |
| viewer@devops.local | viewer123 | VIEWER |

## 📚 文档导航

| 文档 | 内容 |
|------|------|
| [docs/architecture.md](docs/architecture.md) | 架构设计、ADR、API 契约表 |
| [docs/server-guide/](docs/server-guide/) | 服务端搭建教程(7 篇,按顺序实施) |
| [docs/agent-guide/](docs/agent-guide/) | Python Agent 引擎教程(6 篇) |
| [docs/devops-guide/](docs/devops-guide/) | 基础设施教程(3 篇) |
| [AGENTS.md](AGENTS.md) | AI Agent 协作规约(任意智能体通用) |
| [.ai/README.md](.ai/README.md) | AI 工程化内容源:rules / skills / agents / hooks |

## 🤝 参与贡献

1. 提交前必读 [AGENTS.md](AGENTS.md)(协作规约)与 [.ai/rules/](.ai/rules/)(版本红线 / 代码边界 / 安全红线)
2. 提交信息遵循 Conventional Commits:`<type>(<scope>): <subject>`,先过 `pre-commit run --all-files`
3. PR 需填写 [检查清单](.github/pull_request_template.md);Bug / 需求请用对应 [Issue 模板](.github/ISSUE_TEMPLATE/)

## 🗺️ 路线图

- [x] **W1~W2**:Web 端全功能(mock 数据驱动)+ 工程化基座
- [ ] **W3~W4**:Server 端骨架实施(docs/server-guide)
- [ ] **W5**:Agent 引擎实施(docs/agent-guide)
- [ ] **W6**:DevOps 联调与部署(docs/devops-guide)

## 📄 License

[MIT](LICENSE) © 2026 zhanghuaiwei
