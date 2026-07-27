<!-- AI 生成:Agent 引擎教程 02 —— FastAPI 骨架与请求模型 -->
# 02 FastAPI 骨架与请求模型

> 前置:完成 01。骨架代码已在 `app/` 下,本教程讲解"为什么这样设计",并带你填第一个端点。

## 一、骨架结构导读

```
app/
├── main.py            应用入口:lifespan 生命周期 + CORS + 路由注册(已完成)
├── config.py          pydantic-settings 环境变量配置(已完成)
├── schemas/agent.py   请求/响应模型 = API 契约(已完成)
├── api/routes/agent.py  4 个契约端点(TODO)
├── agents/react_agent.py  ReAct Agent 构建器(TODO)
├── tools/             7 个 Tool(TODO)
└── callbacks/sse_callback.py  SSE 事件翻译器(TODO)
```

## 二、FastAPI 的三个关键认知

### 1. 模型即契约

`schemas/agent.py` 中的 `ChatRequest` 等模型,FastAPI 会自动做:类型校验 → 422 错误响应 → OpenAPI 文档生成。`Field(pattern=...)` 的正则就是安全边界 —— 比如 `pr_url` 限定 GitHub PR 格式,挡掉一半乱传参。

### 2. async 的意义

Agent 推理是 IO 密集型(等 LLM 返回),`async def` + uvicorn 单进程就能扛几百并发。**红线**:async 链路里禁止同步阻塞调用(ruff 的 ASYNC 规则会查);比如 docker SDK 是同步的,要用 `asyncio.to_thread()` 包装。

### 3. lifespan 预检

`main.py` 的 lifespan 里要做"启动期体检":LLM Key 为空直接启动失败(fail-fast),Docker 不可达则打印降级警告(docker 类 Tool 返回友好错误,不拖垮整个服务)。这是"可运维性"设计,不是形式主义。

## 三、动手:实现你的第一个端点(/api/agent/code-review 的最小版)

1. 在 route 里注入依赖:`settings: Settings = Depends(get_settings)`
2. 暂时不调 Agent,直接返回硬编码的 `ReviewReport`(先打通契约)
3. `curl -X POST localhost:8000/api/agent/code-review -H 'Content-Type: application/json' -d '{"pr_url":"https://github.com/a/b/pull/1"}'` 验证
4. 在 `/docs` 页面再试一次,观察请求校验(传个非法 URL 看 422)

这个"先返回假数据打通契约,再填真实逻辑"的节奏,和 server 端 02 教程的"临时配置"是同一个方法论:**骨架先行,小步填肉**。

## 四、验收清单

- [ ] 非法 pr_url 返回 422 且错误信息指明字段
- [ ] 最小版 code-review 返回结构符合 ReviewReport
- [ ] 结构化日志(structlog)输出请求耗时,且不含敏感字段
