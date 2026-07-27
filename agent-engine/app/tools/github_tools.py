# AI 生成:GitHub 工具集骨架 —— F1.3 代码审查 Agent 的"手"
# 学习指引见 docs/agent-guide/04-自定义Tool开发.md
from langchain_core.tools import tool


@tool
def github_pr_diff(pr_url: str) -> str:
    """获取 GitHub Pull Request 的代码差异(diff 全文)。

    当需要审查代码、了解 PR 改了什么时使用本工具。
    输入:完整 PR 链接,如 https://github.com/owner/repo/pull/123
    """
    # TODO(学习者):实现 —— httpx 调 GitHub API,Accept: application/vnd.github.v3.diff
    # 注意:description 是 Agent 选择工具的"使用说明书",改它会影响 Agent 行为(AGENTS.md 边界)
    # 注意:diff 可能很长,需截断策略(保留文件头 + 各文件前 N 行),防止爆 context window
    raise NotImplementedError("TODO(学习者):实现 github_pr_diff")


@tool
def github_pr_comments(pr_url: str) -> str:
    """获取 GitHub Pull Request 的已有评论(避免重复提出别人说过的问题)。"""
    # TODO(学习者):实现 —— GET /repos/{owner}/{repo}/pulls/{n}/comments
    raise NotImplementedError("TODO(学习者):实现 github_pr_comments")
