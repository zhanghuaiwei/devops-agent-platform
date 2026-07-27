<!-- AI 生成:规则片段 —— 项目快照与版本红线。唯一内容源,入口文件(CLAUDE.md / AGENTS.md / .trae/rules/)只引用不复制 -->
# 项目快照与版本红线

- **名称**:DevOps Agent 智能运维平台(学习型生产级项目)
- **三端结构**:`web/`(Next.js 14 全功能 + mock 数据层)、`server/`(Spring Boot 3.3 单体 + 自定义 Starter)、`agent-engine/`(FastAPI + LangChain ReAct Agent)
- **版本红线**(不得擅自升级/降级):Java 21 / Spring Boot 3.3.x / MyBatis-Plus 3.5.7 / Python 3.12 / LangChain 0.3.x / FastAPI 0.115.x / Next.js 14.2.x / React 18.3.x / Tailwind 3.4.x / SWR 2.2.x / PostgreSQL 16 / Redis 7.2
- 升级红线内依赖:必须先在 PR 描述中写明 动机 / 破坏性变更评估 / 回滚方案
- 引入新依赖前:查维护活跃度(最近 6 个月有提交)、许可证(禁 GPL)、包体积
