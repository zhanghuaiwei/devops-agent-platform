// AI 生成:Pipeline 端点骨架 —— F1.7(GitHub Actions API 数据采集)
package com.devopsagent.pipeline;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * CI/CD Pipeline REST 端点。数据经 starter 模块的 GitHubApiClient 拉取(边界规则)。
 */
@RestController
@RequestMapping("/api/pipeline")
public class PipelineController {

  /** 最近 10 次构建列表(状态/耗时/Jobs)。 */
  @GetMapping("/runs")
  public Object recentRuns() {
    // TODO(学习者):调 GitHubApiClient.listWorkflowRuns() → 组装契约结构
    throw new UnsupportedOperationException("TODO(学习者):实现构建列表");
  }

  /** 近 30 天失败率统计(按天聚合)。 */
  @GetMapping("/stats")
  public Object failureStats() {
    // TODO(学习者):拉取历史 runs 按天聚合;思考:该实时算还是落库定时算?
    throw new UnsupportedOperationException("TODO(学习者):实现失败率统计");
  }

  /** 触发指定 workflow 重新运行。 */
  @PostMapping("/runs/{id}/rerun")
  public Object rerun(@PathVariable String id) {
    // TODO(学习者):调 GitHubApiClient.rerun();权限:@PreAuthorize("hasAnyRole('ADMIN','DEVELOPER')")
    throw new UnsupportedOperationException("TODO(学习者):实现构建重跑");
  }
}
