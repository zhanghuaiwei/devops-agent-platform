// AI 生成:Starter 自动配置骨架 —— F1.8 核心(条件装配链)
// 学习指引见 docs/server-guide/07-自定义Starter.md
package com.devopsagent.starter;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * DevOps 工具自动配置。
 *
 * <p>装配链(学习者按此实现,理解 Spring Boot 3.3 自动配置原理):
 *
 * <ol>
 *   <li>本类注册在 META-INF/spring/...AutoConfiguration.imports 中,启动时被加载
 *   <li>@EnableConfigurationProperties 绑定 devops.tools.* 到 DevopsToolProperties
 *   <li>每个客户端 Bean 用 @ConditionalOnProperty("devops.tools.xxx.enabled") 条件装配
 *   <li>Bean 内部做 fail-fast 校验(如 enabled=true 但 token 为空 → 启动报错并给出明确提示)
 * </ol>
 */
@AutoConfiguration
@EnableConfigurationProperties(DevopsToolProperties.class)
public class DevopsToolAutoConfiguration {

  // TODO(学习者):按装配链实现三个 @Bean 方法
  // @Bean
  // @ConditionalOnProperty(prefix = "devops.tools.github", name = "enabled", havingValue = "true")
  // GitHubApiClient gitHubApiClient(DevopsToolProperties properties) { ... }

  // TODO(学习者):dockerApiClient / k8sApiClient 同理;docker/k8s 客户端依赖在学习时按需引入
}
