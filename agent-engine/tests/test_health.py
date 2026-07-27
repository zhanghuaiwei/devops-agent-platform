# AI 生成:健康检查冒烟测试 —— 骨架已可运行(pytest 直接过)
# 学习者后续按 test-writer 规约补充 Tool 与 Agent 测试
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_up() -> None:
    """health_正常请求_返回UP与200。"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}
