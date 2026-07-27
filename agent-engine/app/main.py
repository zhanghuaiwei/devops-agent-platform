# AI 生成:FastAPI 应用入口 —— 骨架已可运行(uvicorn app.main:app --reload)
# 学习指引见 docs/agent-guide/02-FastAPI骨架.md
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.agent import router as agent_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """应用生命周期:启动时预检(如 Docker 连通性),关闭时清理资源。"""
    # TODO(学习者):启动预检 —— LLM API Key 非空校验;docker daemon 可达性探测(不可达降级而非崩溃)
    yield
    # TODO(学习者):资源清理(关闭 httpx client、docker client)


app = FastAPI(
    title="DevOps Agent Engine",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS:仅允许 server(8080)内部调用;不直接对浏览器开放(web 只连 Java,边界规则)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# 4 个契约端点(见 docs/architecture.md §2)
app.include_router(agent_router, prefix="/api/agent", tags=["agent"])


@app.get("/health")
async def health() -> dict[str, str]:
    """存活探针:docker-compose healthcheck 与排障用。"""
    return {"status": "UP"}
