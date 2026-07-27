<!-- AI 生成:Agent 引擎教程 05 —— FastAPI SSE 流式输出 -->
# 05 SSE 流式输出(F1.2 思考过程可视化)

> 前置:完成 03、04。对应功能点:F1.2 的"逐步看到 Agent 思考过程"。

## 一、整体数据流(全链路图)

```
LLM 推理(LangChain)
  │ on_agent_action / on_tool_end / on_llm_end ...   ← SSECallbackHandler(骨架已给)
  ▼
asyncio.Queue(事件缓冲,解耦推理速度与推送速度)
  │
  ▼
FastAPI EventSourceResponse(SSE 协议)
  │ HTTP,Content-Type: text/event-stream
  ▼
Java server(读 SSE → 原样转发 WebSocket,见 server 教程 04)
  ▼
浏览器(逐步渲染 thought/action/observation 卡片)
```

## 二、SSE 协议格式(纯文本,肉眼可读)

```text
data: {"type":"action","payload":{"tool":"docker_ps","input":{"service_name":"web"}}}\n\n
data: {"type":"observation","payload":{"output":"Up 3 days"}}\n\n
data: {"type":"final","payload":{"answer":"容器运行正常..."}}\n\n
```

每条事件以 `data: ` 开头、两个换行结尾 —— 就这么简单。`sse_starlette.EventSourceResponse` 帮你处理协议细节和断连检测。

## 三、实施:填充 /api/agent/chat

```python
@router.post("/chat")
async def chat(request: ChatRequest):
    handler = SSECallbackHandler()
    executor = build_agent_executor(request.agent_type)

    async def run_agent():
        # 在后台任务里跑 Agent,事件经 handler 进队列
        await executor.ainvoke({"input": request.message},
                               config={"callbacks": [handler]})

    async def event_generator():
        task = asyncio.create_task(run_agent())
        while True:
            event = await handler.queue.get()
            if event["type"] == "done":
                break
            yield {"data": json.dumps(event, ensure_ascii=False)}
        # 传播 Agent 异常为 error 事件,而不是直接断流
        if task.exception():
            yield {"data": json.dumps({"type": "error",
                                       "payload": {"message": str(task.exception())}},
                                       ensure_ascii=False)}

    return EventSourceResponse(event_generator())
```

## 四、三个关键设计(面试可聊)

1. **为什么用 asyncio.Queue**:Agent 推理和生产事件是"推",SSE 发送是"拉",Queue 是两者之间的缓冲带;Agent 快/网络慢时事件在队列里等,互不阻塞
2. **done 哨兵事件**:队列没有"关闭"概念,塞一个特殊事件通知生成器退出,同时 `task.exception()` 保证 Agent 异常不会静默丢失
3. **断连处理**:用户关闭浏览器 → EventSourceResponse 触发取消 → 应同时 `task.cancel()` 停掉 Agent,**否则 LLM 还在后台烧 Token**(成本红线)

## 五、token 逐字流式(可选进阶)

`ChatOpenAI(streaming=True)` + `on_llm_new_token` 回调 → 每个 token 一个事件,前端打字机效果。注意:ReAct 模式下中间轮的 token 不要推(那些是 Thought/Action 的内部生成),只推最终 Final Answer 的 token —— 通过 `on_llm_new_token` 的 `chunk` 内容或 tag 过滤。

## 六、验收清单

- [ ] `curl -N -X POST localhost:8000/api/agent/chat -d '...'` 能看到事件逐条出现(不是一次性返回)
- [ ] 中途 Ctrl+C,日志显示 Agent 任务被取消
- [ ] LLM 报错(如故意填错 API Key)→ 收到 error 事件而非连接直接断开
- [ ] Java server 桥接后,前端卡片按序渲染
