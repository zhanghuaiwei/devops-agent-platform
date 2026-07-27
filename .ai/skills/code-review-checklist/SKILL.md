---
# AI 生成:Skill 内容源 —— 本仓库代码审查清单。适配层:.claude/commands/review.md(各智能体入口只引用本文件)
name: code-review-checklist
description: 按本仓库四级严重度审查代码变更。当用户要求"审查/ review 这段代码或这次改动"时使用。
---

# Code Review Checklist Skill

按优先级输出审查结论,每条给出:严重级别 / 文件:行号 / 问题 / 修复建议。

## P0 — 安全(必须修复)

- [ ] 硬编码密钥/Token/连接串(对照 gitleaks 规则)
- [ ] SQL 字符串拼接(必须 MyBatis-Plus 参数绑定)
- [ ] Markdown/HTML 未 sanitize 直接渲染(XSS)
- [ ] 认证端点无限流;鉴权端点缺 `@PreAuthorize`

## P1 — 边界(必须修复)

- [ ] web 组件直连数据库/直接 new HTTP client(必须走 `/api/**`)
- [ ] server 直连 agent 数据源(必须走 4 个契约端点)
- [ ] mock 数据出现在 `web/src/mocks/` 之外
- [ ] 代码落在错误的包(对照 `.ai/rules/boundaries.md` 包结构表)
- [ ] 带 `TODO(学习者)` 标记的骨架文件被 AI 补全实现

## P2 — 规范(应当修复)

- [ ] Java:`System.out.println`、空 catch、缺 Javadoc
- [ ] Python:缺类型注解、`print()`、同步阻塞 IO 出现在 async 链路
- [ ] TS:`any`、缺 Props 接口、组件内联 mock 常量
- [ ] 缺"AI 生成"标注或关键逻辑注释

## P3 — 性能(建议修复)

- [ ] Web:列表缺 key、大对象放 useState 导致重复渲染、SWR key 设计不当导致重复请求
- [ ] Server:N+1 查询、缺分页、同步调用 agent-engine 长任务未用虚拟线程/异步
- [ ] Agent:Tool 无超时、Prompt 过长未裁剪
