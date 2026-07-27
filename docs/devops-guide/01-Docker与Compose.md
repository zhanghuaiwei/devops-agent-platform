<!-- AI 生成:DevOps 教程 01 —— Docker 与 Compose -->
# 01 Docker 容器化与 Compose 编排

> 对应里程碑:W1(基础设施)、W5(应用容器化)。预计耗时:2 小时。

## 一、W1 阶段:只启动基础设施

```bash
cd devops
docker compose up -d postgres redis minio
docker compose ps                 # 三个服务 running
docker compose logs -f postgres   # 观察 init.sql 执行日志
```

验证表已建:`docker compose exec postgres psql -U devops -d devops_agent -c '\dt'` → 4 张表。

## 二、必须理解的 6 个概念(对照 docker-compose.yml 逐行)

| 概念 | 本项目实例 | 常见误区 |
|------|-----------|----------|
| image vs container | postgres:16-alpine 是镜像;跑起来是容器 | 以为改了容器会改镜像 |
| volumes | pgdata 命名卷持久化数据 | 数据写容器层,`down` 就没了 |
| healthcheck | pg_isready / redis-cli ping | depends_on 只等"启动",不等"就绪" |
| 容器网络 | server 用 `DB_HOST: postgres` 互访 | 在容器里连 localhost 找数据库(找不到) |
| init 脚本 | init.sql 只在卷为空时执行一次 | 改了 SQL 重启不生效(要 `down -v`) |
| 环境变量 | 密钥只走 env_file / environment 注入 | 把密码写进镜像层(安全红线) |

## 三、Dockerfile 多阶段构建(三个应用镜像同套路)

```text
阶段 1(构建):Maven/npm/pip 全套工具 → 产出 jar / standalone / site-packages
阶段 2(运行):仅 JRE / node / python-slim + 非 root 用户
```

收益:镜像体积 ~800MB → ~250MB;攻击面小;构建缓存友好(依赖层与源码层分离)。

## 四、W5 阶段:全栈启动

1. 取消 docker-compose.yml 中 agent-engine / server / web 的注释
2. `docker compose up -d --build`
3. `docker compose logs -f server` 观察启动顺序(depends_on + healthcheck 的作用)

## 五、常用排障命令

```bash
docker compose ps                          # 状态总览
docker compose logs -f --tail=100 server   # 追日志
docker compose exec redis redis-cli ping   # 进容器执行命令
docker stats                               # 资源占用(F1.6 的对照数据)
```

## 六、验收清单

- [ ] 基础设施三服务 healthy
- [ ] `\dt` 看到 4 张表
- [ ] MinIO 控制台(localhost:9001)能登录
- [ ] `docker compose down && up -d` 数据不丢(卷持久化生效)
