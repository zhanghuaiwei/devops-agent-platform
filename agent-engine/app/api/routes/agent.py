# AI 生成:Agent 路由骨架 —— 4 个契约端点(F1.2/F1.3/F1.4/F1.5)
# 学习指引见 docs/agent-guide/02-FastAPI骨架.md 与 05-SSE流式输出.md
from fastapi import APIRouter

from app.schemas.agent import (
    ChatRequest,
    CodeReviewRequest,
    DeployCheckRequest,
    DiagnoseRequest,
)

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest) -> None:
    """主对话入口:SSE 流式返回 Agent 推理事件(协议见 docs/architecture.md §3)。

    学习者实现要点:
    1. 创建 SSECallbackHandler(见 app/callbacks/sse_callback.py 骨架)
    2. 构建 ReAct AgentExecutor,callbacks=[handler]
    3. 用 sse_starlette.EventSourceResponse 包装异步生成器
    4. 异常兜底:LLM 超时/工具报错 → 发 error 事件,不要直接 500
    """
    raise NotImplementedError("TODO(学习者):实现 SSE 主对话端点")


@router.post("/code-review")
async def code_review(request: CodeReviewRequest) -> None:
    """代码审查 Agent(F1.3):PR URL → 分级审查报告(结构化 JSON 输出)。

    学习者实现要点:
    1. github_pr_diff Tool 拉 diff
    2. Prompt 用 Few-Shot + Output Format 约束(见 docs/agent-guide/03)
    3. 用 Pydantic Output Parser 解析 LLM 输出为 ReviewReport
    """
    raise NotImplementedError("TODO(学习者):实现代码审查端点")


@router.post("/deploy")
async def deploy_check(request: DeployCheckRequest) -> None:
    """部署检查 Agent(F1.4):容器状态 + 健康检查 + 日志分析 → 部署结论。"""
    raise NotImplementedError("TODO(学习者):实现部署检查端点")


@router.post("/diagnose")
async def diagnose(request: DiagnoseRequest) -> None:
    """故障诊断 Agent(F1.5):错误聚合 + 时间线重建 + 根因分析。"""
    raise NotImplementedError("TODO(学习者):实现故障诊断端点")
