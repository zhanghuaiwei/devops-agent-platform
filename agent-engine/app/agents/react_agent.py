# AI 生成:ReAct Agent 构建器骨架 —— F1.2 核心
# 学习指引见 docs/agent-guide/03-LangChain-ReAct-Agent.md
from langchain_openai import ChatOpenAI

from app.config import get_settings


def build_llm() -> ChatOpenAI:
    """构建 LLM 客户端(骨架已完成)。

    OpenAI 兼容协议:同一份代码,改 base_url 即可切换千问/DeepSeek —— 这就是选
    langchain-openai 而非厂商专用包的原因(ADR:可替换性)。
    """
    settings = get_settings()
    return ChatOpenAI(
        api_key=settings.llm_api_key,  # noqa: S106  # pydantic-settings 注入,非硬编码
        base_url=settings.llm_base_url,
        model=settings.llm_model,
        temperature=settings.llm_temperature,
        streaming=True,  # 流式:token 逐字推送的体感来源(F1.2)
    )


def build_agent_executor(agent_type: str) -> None:
    """按 Agent 类型构建 ReAct AgentExecutor。

    学习者实现要点(对照教程 03):
    1. 用 create_react_agent(llm, tools, prompt) 构建 Agent
       - prompt 必须包含 {tools} {tool_names} {input} {agent_scratchpad} 四个占位符
    2. 不同 agent_type 挂不同 Tool 子集 + 不同 system prompt
       (code_review → github tools;deploy → docker/http tools;diagnose → log tools)
    3. AgentExecutor(max_iterations=settings.agent_max_iterations,
                     handle_parsing_errors=True,  # LLM 输出格式错误时给一次自我修正机会
                     return_intermediate_steps=True)  # F1.2 思考过程可视化的数据来源
    """
    raise NotImplementedError("TODO(学习者):实现 ReAct AgentExecutor 构建")
