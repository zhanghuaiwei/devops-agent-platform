// AI 生成:全局异常处理骨架 —— 统一错误响应格式,三端错误约定见 docs/architecture.md
package com.devopsagent.common;

import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理(@RestControllerAdvice)。
 *
 * <p>统一响应格式:{ "code": 业务码, "message": "人类可读信息", "timestamp": ... }
 *
 * <p>学习者需覆盖:
 *
 * <ul>
 *   <li>MethodArgumentNotValidException → 400 参数错误(提取首个字段错误)
 *   <li>BadCredentialsException → 401 账密错误(不泄露"用户不存在"还是"密码错")
 *   <li>AccessDeniedException → 403 无权限
 *   <li>RateLimitExceededException(自定义)→ 429
 *   <li>Exception → 500 兜底,日志打堆栈,响应不含内部信息(安全红线:不泄露内部细节)
 * </ul>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
  // TODO(学习者):按上述清单实现各 @ExceptionHandler 方法
}
