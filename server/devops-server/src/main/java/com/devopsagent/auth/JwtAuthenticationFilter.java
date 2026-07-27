// AI 生成:JWT 认证过滤器骨架 —— F1.1 无状态认证
// 学习指引见 docs/server-guide/03-SpringSecurity-JWT.md
package com.devopsagent.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT 认证过滤器:每个请求执行一次,解析 Authorization: Bearer <token>。
 *
 * <p>学习者实现步骤:
 *
 * <ol>
 *   <li>从 Header 取 token,无则放行(交给后续鉴权拦截)
 *   <li>用 jjwt 校验签名与过期时间
 *   <li>检查 Redis 黑名单(登出/刷新后旧 token 立即失效)
 *   <li>构造 UsernamePasswordAuthenticationToken 塞入 SecurityContextHolder
 * </ol>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    // TODO(学习者):实现上述四步;注意 filterChain.doFilter(request, response) 必须最后调用
    throw new UnsupportedOperationException("TODO(学习者):实现 JWT 解析与 SecurityContext 填充");
  }
}
