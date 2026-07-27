# AI 生成:Tool 注册表 —— 骨架已完成
# 设计:集中注册 + 按 agent_type 分组导出,Agent 构建器按类型取子集(见 react_agent.py)
from app.tools.docker_tools import docker_logs, docker_ps
from app.tools.github_tools import github_pr_comments, github_pr_diff
from app.tools.ops_tools import http_health_check, k8s_pod_status, log_parser

# 全部工具(7 个,对齐架构图)
ALL_TOOLS = [
    github_pr_diff,
    github_pr_comments,
    docker_ps,
    docker_logs,
    log_parser,
    http_health_check,
    k8s_pod_status,
]

# 按 Agent 类型的工具子集:不同 Agent 只给"它需要的工具",
# 工具越少 → LLM 选择越准、Prompt 越短、成本越低(F1.2 意图分类的下游收益)
AGENT_TOOLSETS: dict[str, list] = {
    "code_review": [github_pr_diff, github_pr_comments],
    "deploy": [docker_ps, docker_logs, http_health_check],
    "diagnose": [docker_logs, log_parser, k8s_pod_status],
    "general": ALL_TOOLS,
}
