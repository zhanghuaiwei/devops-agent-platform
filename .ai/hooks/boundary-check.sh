#!/usr/bin/env bash
# AI 生成:代码边界检查脚本 —— 被 pre-commit 与各 AI 智能体 hooks 复用
# 规则来源:.ai/rules/boundaries.md"代码边界"
# 发现违例时输出文件:行号并以非零码退出,阻止提交
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FAILED=0

echo "[boundary-check] 检查代码边界..."

# 边界 1:mock 数据只允许出现在 web/src/mocks/(组件禁止内联 mock 常量)
# 匹配业务组件里的 MOCK_/mockData 等命名常量定义
if grep -rn --include='*.tsx' --include='*.ts' -E '^(const|export const) (MOCK_|mockData)' \
    "$ROOT/web/src" --exclude-dir=mocks 2>/dev/null; then
  echo "[boundary-check] 违规:mock 常量定义在 web/src/mocks/ 之外(边界:mock 边界)"
  FAILED=1
fi

# 边界 2:web 业务组件禁止直连后端域名/端口(必须走 /api/** 相对路径)
if grep -rn --include='*.tsx' --include='*.ts' -E 'fetch\(["'\'']https?://' \
    "$ROOT/web/src" --exclude-dir=mocks --exclude-dir=api 2>/dev/null; then
  echo "[boundary-check] 违规:web 组件出现绝对 URL fetch(边界:Web → Server 只走 /api/**)"
  FAILED=1
fi

# 边界 3:server 禁止直连 agent 数据源(docker/k8s API 只能在 starter 与 tools 中)
if grep -rn --include='*.java' -E 'com\.github\.dockerjava|io\.kubernetes' \
    "$ROOT/server/devops-server/src" 2>/dev/null; then
  echo "[boundary-check] 违规:server 主应用直接依赖 docker/k8s 客户端(应封装在 starter 模块)"
  FAILED=1
fi

# 边界 4:任何代码禁止硬编码密钥(粗筛,精扫交给 gitleaks)
# 说明:web/src/mocks 是 mock 数据层(定义即假数据,如"审查报告中的错误示范"文案),豁免本规则
if grep -rn --include='*.java' --include='*.py' --include='*.ts' --include='*.tsx' \
    -E '(password|secret|api_?key)\s*=\s*["'\''][^"'\''\$]{8,}' \
    "$ROOT/server" "$ROOT/agent-engine" "$ROOT/web/src" 2>/dev/null \
    --exclude-dir=mocks --exclude-dir=.venv --exclude-dir=node_modules \
    | grep -v -i 'example\|placeholder\|TODO' ; then
  echo "[boundary-check] 违规:疑似硬编码密钥(安全红线第 1 条)"
  FAILED=1
fi

if [ "$FAILED" -eq 1 ]; then
  echo "[boundary-check] 未通过,请修复上述违规后重新提交"
  exit 1
fi
echo "[boundary-check] 通过"
