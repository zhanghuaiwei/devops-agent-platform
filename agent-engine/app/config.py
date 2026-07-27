# AI 生成:配置管理 —— 骨架已完成,学习者无需修改
# 设计:pydantic-settings 从环境变量读取配置,类型安全 + 启动期校验 fail-fast
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置(全部从环境变量注入,安全红线:密钥不落代码)。"""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # LLM 配置(OpenAI 兼容协议:千问/DeepSeek 通用)
    llm_api_key: str = ""
    llm_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    llm_model: str = "qwen-turbo"
    llm_temperature: float = 0.1  # 运维场景要确定性输出,温度压低

    # 外部工具凭据
    github_token: str = ""
    docker_host: str = "unix:///var/run/docker.sock"

    # Agent 运行参数
    agent_max_iterations: int = 8  # ReAct 循环上限:防 Agent 陷入死循环烧 Token


@lru_cache  # 进程内单例:避免每次请求都重读环境变量
def get_settings() -> Settings:
    return Settings()
