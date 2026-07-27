<!-- 本文由 AI 生成,作为项目入口说明;如有与实际代码出入,以代码为准 -->
# DevOps Agent 智能运维平台

> 用 AI Agent 自动化日常 DevOps 操作——代码审查、部署检查、告警诊断、日志分析,一个聊天窗口搞定运维。

## 项目定位

- **学习项目**:AI 全栈工程师转型项目一(周期 6 周,W1~W6)
- **架构形态**:三端单体架构(Web → Spring Boot 单体 → Python Agent 引擎),刻意选择单体而非微服务,见 `docs/architecture.md` 的 ADR 记录

## 仓库结构(Monorepo)

```
devops-agent-platform/
├── web/                  # 前端:Next.js 14 + React 18 + Tailwind + SWR(全功能,mock 数据驱动)
├── server/               # 服务端:Java 21 + Spring Boot 3.3 多模块骨架(实施见 docs/server-guide)
├── agent-engine/         # Agent 引擎:Python 3.12 + FastAPI + LangChain 0.3 骨架(实施见 docs/agent-guide)
├── devops/               # 基础设施:Docker Compose / Nginx / Dockerfile(实施见 docs/devops-guide)
├── docs/                 # 全部教程与架构文档
│   ├── architecture.md   # 架构设计与 ADR
│   ├── server-guide/     # 服务端框架搭建教程(7 篇,按顺序实施)
│   ├── agent-guide/      # Python Agent 引擎搭建教程(6 篇)
│   └── devops-guide/     # DevOps 基础设施搭建教程(3 篇)
├── .workbuddy/           # AI 编程工程化:skills / subAgent / hooks
├── .github/workflows/    # CI:代码规范检查 + 安全扫描 + 自动测试
├── CLAUDE.md             # AI 编程助手的项目级约束(Claude Code 自动加载)
├── AGENTS.md             # 通用 AI Agent 协作规约
└── CODEBUDDY.md          # WorkBuddy 专属协作规约
```

## 快速开始

```bash
# 1. Web 端(开箱即跑,内置 mock 数据层)
cd web && npm install && npm run dev     # http://localhost:3000

# 2. 服务端与 Python 端:按 docs/ 下教程逐步实施(学习设计,由你亲手搭建)

# 3. 基础设施(待 server/agent-engine 就绪后)
cd devops && docker compose up -d        # PostgreSQL / Redis / MinIO
```

## Mock 账号(Web 端演示)

| 账号 | 密码 | 角色 |
|------|------|------|
| admin@devops.local | admin123 | ADMIN |
| dev@devops.local | dev123 | DEVELOPER |
| viewer@devops.local | viewer123 | VIEWER |

## 工程化约定

提交代码前请务必阅读:`AGENTS.md`(协作规约)、`.pre-commit-config.yaml`(提交前自动检查)、`.github/workflows/ci.yml`(CI 流水线)。
