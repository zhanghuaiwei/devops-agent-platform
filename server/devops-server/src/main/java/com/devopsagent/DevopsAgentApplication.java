// AI 生成:Spring Boot 启动类 —— 骨架已完成,学习者无需修改
// 说明:@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan
// 自动装配会读取 starter 模块 META-INF/spring/...AutoConfiguration.imports(F1.8 的核心机制)
package com.devopsagent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DevOps Agent 智能运维平台主应用入口。
 *
 * <p>启动前请确认:PostgreSQL(5432)、Redis(6379)已通过 devops/docker-compose.yml 启动。
 */
@SpringBootApplication
public class DevopsAgentApplication {

  public static void main(String[] args) {
    SpringApplication.run(DevopsAgentApplication.class, args);
  }
}
