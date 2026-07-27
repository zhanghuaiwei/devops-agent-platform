# AI 生成:Pydantic 请求/响应模型 —— 骨架已完成(契约定义,docs/architecture.md §2)
# 说明:模型即接口契约;改字段前必须同步 server 与 web(见 api-contract-check skill)
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """主对话请求:server 编排层转发来的用户消息。"""

    session_id: str = Field(min_length=1, description="会话 ID(用于多轮上下文)")
    message: str = Field(min_length=1, max_length=4000, description="用户输入")
    agent_type: str = Field(
        default="general",
        pattern="^(code_review|deploy|diagnose|general)$",
        description="server 意图分类结果;Agent 引擎信任该路由决策",
    )


class CodeReviewRequest(BaseModel):
    """代码审查请求(F1.3)。"""

    pr_url: str = Field(pattern=r"^https://github\.com/.+/pull/\d+$", description="GitHub PR 链接")


class DeployCheckRequest(BaseModel):
    """部署检查请求(F1.4)。"""

    service_name: str = Field(min_length=1, description="Docker 容器/服务名")
    health_url: str | None = Field(default=None, description="健康检查端点,如 /actuator/health")
    log_minutes: int = Field(default=15, ge=1, le=120, description="分析最近 N 分钟日志")


class DiagnoseRequest(BaseModel):
    """故障诊断请求(F1.5)。"""

    service_names: list[str] = Field(min_length=1, description="涉及的服务列表")
    time_range_minutes: int = Field(default=30, ge=5, le=360, description="日志时间范围")


# ---- 响应模型(LLM 结构化输出的目标结构,F1.3 验收标准) ----


class ReviewIssue(BaseModel):
    """单条审查问题。"""

    severity: str = Field(pattern="^(critical|high|medium|low)$")
    category: str = Field(description="security/sql-injection/xss/style/complexity 等")
    file: str
    line: int | None = None
    description: str
    suggestion: str


class ReviewReport(BaseModel):
    """代码审查报告:LLM 结构化输出用 Pydantic Output Parser 解析为本模型。"""

    verdict: str = Field(pattern="^(approve|request_changes|reject)$")
    issues: list[ReviewIssue]
    summary: str
