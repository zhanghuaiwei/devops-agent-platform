// AI 生成:@RateLimit 自定义注解 —— 骨架已完成;AOP 切面由学习者实现
// 学习指引见 docs/server-guide/03-SpringSecurity-JWT.md §限流
package com.devopsagent.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 限流注解:基于 Redis 滑动窗口计数。
 *
 * <p>用法示例(F1.1 登录限流):@RateLimit(key = "login", limit = 10, windowSeconds = 300)
 *
 * <p>学习者需在 common 包实现 RateLimitAspect(@Aspect + @Around):
 * 用 ProceedingJoinPoint 拿方法签名,用客户端 IP + key 拼 Redis key,超限抛 429。
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

  /** 业务标识,用于区分不同限流场景(如 login / agent-call)。 */
  String key();

  /** 窗口内允许的最大次数。 */
  int limit();

  /** 窗口长度(秒)。 */
  int windowSeconds();
}
