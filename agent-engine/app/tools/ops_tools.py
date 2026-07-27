# AI 生成:通用运维工具集骨架 —— 日志解析 / HTTP 健康检查 / K8s 状态
from langchain_core.tools import tool


@tool
def log_parser(raw_logs: str) -> str:
    """通用日志解析:提取 Error/Warn 级别日志,按错误类型聚合统计。

    故障诊断(F1.5)的第一步:先聚合再给 LLM,比直接塞原始日志省 Token 且更准。
    """
    # TODO(学习者):实现 —— 正则提取级别/时间/异常类名,按异常类聚合计数
    # 这是纯函数,不依赖外部服务,是你第一个能独立完成并测试的 Tool,建议从这里开始
    raise NotImplementedError("TODO(学习者):实现 log_parser")


@tool
def http_health_check(url: str) -> str:
    """对指定 URL 发起 HTTP 健康检查,返回状态码、耗时与响应摘要。

    部署检查(F1.4)用:典型目标是服务的 /actuator/health。
    """
    # TODO(学习者):实现 —— httpx.AsyncClient,超时 ≤5s;注意 SSRF 边界(只允许内网地址)
    raise NotImplementedError("TODO(学习者):实现 http_health_check")


@tool
def k8s_pod_status(namespace: str, app_label: str) -> str:
    """查询 K8s 指定 namespace 下应用 Pod 的状态(Running/Pending/CrashLoopBackOff)。

    项目一为可选 Tool(本地 MacBook 无 K8s 集群时用 docker_ps 替代);项目三 K8s 阶段启用。
    """
    # TODO(学习者,可选):实现 —— kubernetes 官方 client,label_selector=f"app={app_label}"
    raise NotImplementedError("TODO(学习者,可选):实现 k8s_pod_status")
