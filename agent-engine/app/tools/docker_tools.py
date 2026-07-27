# AI 生成:Docker 工具集骨架 —— F1.4 部署检查 Agent 的"手"
from langchain_core.tools import tool


@tool
def docker_ps(service_name: str) -> str:
    """查询指定服务的 Docker 容器运行状态(Up/Restarting/Exited 及重启次数)。

    部署检查的第一步:容器都没起来,后面的检查没意义。
    """
    # TODO(学习者):实现 —— docker SDK(docker.from_env()),按名称过滤容器
    # 安全注意:docker socket 等同 root 权限,本服务永远不要暴露公网
    raise NotImplementedError("TODO(学习者):实现 docker_ps")


@tool
def docker_logs(service_name: str, minutes: int = 15) -> str:
    """获取指定容器最近 N 分钟的日志(供 LLM 分析异常模式)。

    输入:service_name 容器名;minutes 时间范围(1~120,默认 15)
    """
    # TODO(学习者):实现 —— docker SDK logs(since=...);日志量大时按行数截断 + 去重(相同错误折叠)
    raise NotImplementedError("TODO(学习者):实现 docker_logs")
