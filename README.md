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

## 💡 为什么需要这个项目？

在日常 DevOps 工作中，运维工程师和开发者的时间大量消耗在**重复性操作**和**多工具切换**上：

| 痛点 | 现状 | 本项目如何解决 |
|------|------|---------------|
| 🧩 **工具碎片化** | 代码审查在 GitHub，监控看 Grafana，日志查 ELK，部署用 Jenkins —— 每个操作都要切工具、学界面 | **一个聊天窗口统一入口**，AI Agent 自动理解你的意图并调用背后工具 |
| 🔁 **重复劳动** | 每次部署前手动检查清单(代码覆盖率 / 安全漏洞 / 配置变更)、每次告警后重复查询日志和指标 | **Agent 自动执行 SOP**，输出结构化检查报告，释放人力做真正需要判断的事 |
| ⏱️ **故障定位慢** | 收到告警 → 打开多个监控面板 → 搜日志 → 查变更记录 → 关联上下文，平均 20 分钟才找到根因 | **AI 并行拉取日志 + 指标 + 变更记录**，自动关联时间线，秒级给出诊断结论 |
| 📉 **经验不可复制** | 老运维的排障直觉和操作流程只在他脑子里，新人上手周期 3 个月以上 | **Agent 操作链路可追溯、可复用**，新手输入一句话就能复现资深工程师的排查路径 |
| 👀 **审查遗漏** | 人工代码审查受限于注意力带宽，安全漏洞、N+1 查询、并发问题容易被漏掉 | **多维度自动审查**(安全 / 性能 / 规范)，与人工审查互补而非替代 |

## 🎯 实现了什么

一个**三端分离、AI Agent 驱动的运维助手平台**，核心链路为：

```
用户输入一句话   →   Web 聊天窗口（Next.js，流式渲染 Agent 思考过程）
                 →   Server（Spring Boot，认证 / 编排 / 持久化）
                 →   Agent Engine（Python + LangChain ReAct Agent，调用真实运维工具）
```

**当前已实现**：

| 层 | 当前状态 | 说明 |
|----|---------|------|
| **Web 端** | ✅ 全功能可用 | 对话界面 / Agent 步骤可视化 / 流式渲染 / 多角色 Mock 登录 / 仪表盘（mock 数据驱动，可独立运行演示） |
| **Server 端** | 🔥 骨架就绪，实施中 | Java 21 + Spring Boot 3.3，认证 / WebSocket / MyBatis-Plus / 自定义 Starter 框架已搭好，核心逻辑由学习者按照 7 篇教程亲手实现 |
| **Agent Engine** | 📋 骨架就绪，待实施 | FastAPI + LangChain 0.3，ReAct Agent / SSE 流式 / Docker & GitHub & 运维三类自定义 Tool 框架已搭好，核心逻辑由学习者按照 6 篇教程亲手实现 |
| **DevOps** | 📋 待联调 | Docker Compose 编排 / Nginx 反向代理 / GitHub Actions CI/CD |

**核心功能一览**：

```
┌─────────────────────────────────────────────────────────┐
│                     📱 运维对话入口                        │
│  "审查 PR #42"  "检查今天部署状态"  "查 /api 的 QPS"      │
└────────────────────────┬────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌────────┐    ┌──────────────┐    ┌────────────────┐
│ 代码审查 │    │   部署检查    │    │   故障诊断      │
│ · 安全漏洞 │    │ · 配置变更   │    │ · 日志分析     │
│ · N+1 查询 │    │ · 依赖版本   │    │ · 指标关联     │
│ · 代码规范 │    │ · 回滚方案   │    │ · 变更追溯     │
│ · 并发风险 │    │ · 健康检查   │    │ · 根因推荐     │
└────────┘    └──────────────┘    └────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │    监控查询       │
              │ · Prometheus 指标 │
              │ · 数据库慢查询   │
              │ · JVM 内存/GC    │
              └──────────────────┘
```

## ✨ 项目特性

- 🤖 **Agent 驱动**:LangChain ReAct Agent 自动推理→调用工具→返回结果，SSE 流式推送每一步思考过程
- 🔍 **四大场景一体**:代码审查 / 部署检查 / 故障诊断 / 监控指标，同一个对话入口
- 🏗️ **刻意单体**（[ADR](docs/architecture.md)）:Web → Spring Boot → Python Agent 三端分离但各端单体，避免学习项目引入不必要的分布式复杂度
- 🎓 **骨架 + 教程**:`server/` 与 `agent-engine/` 提供带 `TODO(学习者)` 的骨架代码 + 16 篇编号教程，由你亲手搭建
- 🛡️ **生产级工程化**:pre-commit + CI 多道流水线 + gitleaks 密钥扫描 + 代码边界自动检查 + CODEOWNERS + dependabot
- 🧠 **AI 编程工程化**:`.ai/` 单一内容源(rules / skills / agents / hooks)，适配 Claude Code / Codex / Trae / WorkBuddy

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
