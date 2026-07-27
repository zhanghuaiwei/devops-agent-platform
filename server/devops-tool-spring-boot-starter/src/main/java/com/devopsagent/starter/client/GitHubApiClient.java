// AI 生成:GitHub API 客户端骨架 —— F1.3(PR diff)与 F1.7(Actions runs)的数据来源
package com.devopsagent.starter.client;

/**
 * GitHub REST API 客户端。
 *
 * <p>学习者实现要点:
 *
 * <ul>
 *   <li>HTTP 客户端用 Spring 6 的 RestClient(比 RestTemplate 更现代的流式 API)
 *   <li>鉴权:Authorization: Bearer <token> 请求头
 *   <li>分页:per_page=100 + Link 头遍历
 *   <li>限流:GitHub API 5000 次/小时,注意 X-RateLimit-Remaining;失败时指数退避重试
 *   <li>安全:token 从 DevopsToolProperties 注入,日志中禁止打印(安全红线)
 * </ul>
 */
public class GitHubApiClient {

  private final String token;
  private final String repository;

  public GitHubApiClient(String token, String repository) {
    this.token = token;
    this.repository = repository;
  }

  /** F1.3:拉取指定 PR 的 diff 文本(用于代码审查 Agent)。 */
  public String fetchPullRequestDiff(int pullNumber) {
    // TODO(学习者):GET /repos/{repo}/pulls/{n} 带 Accept: application/vnd.github.v3.diff
    throw new UnsupportedOperationException("TODO(学习者):实现 PR diff 拉取");
  }

  /** F1.7:最近 N 次 workflow runs。 */
  public Object listWorkflowRuns(int limit) {
    // TODO(学习者):GET /repos/{repo}/actions/runs?per_page={limit}
    throw new UnsupportedOperationException("TODO(学习者):实现 workflow runs 列表");
  }

  /** F1.7:重新运行指定 workflow run。 */
  public void rerunWorkflow(String runId) {
    // TODO(学习者):POST /repos/{repo}/actions/runs/{id}/rerun
    throw new UnsupportedOperationException("TODO(学习者):实现构建重跑");
  }
}
