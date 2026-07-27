# AI 生成:SSE 回调处理器骨架 —— F1.2 思考过程可视化的核心机制
# 学习指引见 docs/agent-guide/05-SSE流式输出.md
import asyncio
from typing import Any

from langchain_core.callbacks import AsyncCallbackHandler
from langchain_core.outputs import LLMResult


class SSECallbackHandler(AsyncCallbackHandler):
    """把 LangChain 生命周期事件翻译成 SSE 事件,推给调用方(Java server)。

    机制(学习者需理解):
    - LangChain 在 Agent 推理的每个关键节点回调 on_* 方法
    - 我们把事件塞进 asyncio.Queue,route 层的 SSE 生成器从队列取事件逐个 yield
    - 队列解耦了"Agent 推理速度"和"网络推送速度"(背压设计的雏形)
    """

    def __init__(self) -> None:
        # 事件队列:route 层的生成器消费它
        self.queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()

    async def on_agent_action(self, action: Any, **kwargs: Any) -> None:
        """Agent 决定调用某个 Tool 时触发 → 对应 action 事件(thought→action)。"""
        # TODO(学习者):从 action 提取 tool/tool_input/log,组装 {type: action, payload: {...}}
        raise NotImplementedError("TODO(学习者):实现 on_agent_action")

    async def on_tool_end(self, output: str, **kwargs: Any) -> None:
        """Tool 执行完成时触发 → 对应 observation 事件。"""
        # TODO(学习者):注意截断超长输出(>2000 字符),防止撑爆前端与 Token
        raise NotImplementedError("TODO(学习者):实现 on_tool_end")

    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """LLM 一次生成完成。"""
        # TODO(学习者):提取文本,区分中间思考(thought)与最终回答(final)

    async def on_chain_end(self, outputs: Any, **kwargs: Any) -> None:
        """整条链结束:往队列塞结束标记,通知 SSE 生成器关闭流。"""
        await self.queue.put({"type": "done"})
