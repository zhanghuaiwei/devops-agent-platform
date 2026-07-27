<!-- AI 生成:Agent 引擎教程 03 —— LangChain 0.3 ReAct Agent -->
# 03 LangChain 0.3 ReAct Agent(F1.2 核心)

> 前置:完成 02。本课是 Python 端的灵魂,建议完整一天。

## 一、ReAct 心智模型

```
用户问题
  → Thought(思考:我需要查 PR 的 diff)
  → Action(行动:调用 github_pr_diff,参数 {...})
  → Observation(观察:拿到 diff 文本)
  → Thought(思考:diff 里有硬编码密钥嫌疑...)
  → Action / Observation ...(循环)
  → Final Answer(最终回答)
```

LLM 是"大脑",Tool 是"手",ReAct 是让大脑和手交替工作的循环协议。你要写的 AgentExecutor 就是这个循环的执行器。

## 二、实施:填充 build_agent_executor

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate

REACT_PROMPT = PromptTemplate.from_template(
    """你是一个资深 DevOps 工程师。用工具回答用户问题。

可用工具:
{tools}

工具名列表:{tool_names}

格式:
Question: 用户问题
Thought: 你的思考
Action: 工具名(必须来自工具名列表)
Action Input: 工具参数
Observation: 工具返回
...(Thought/Action/Action Input/Observation 可重复)
Thought: 我现在知道最终答案了
Final Answer: 最终回答(中文,Markdown 格式)

Question: {input}
Thought: {agent_scratchpad}"""
)

agent = create_react_agent(llm, tools, REACT_PROMPT)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=settings.agent_max_iterations,  # 防死循环烧 Token
    handle_parsing_errors=True,                     # 给 LLM 一次自我修正机会
    return_intermediate_steps=True,                 # F1.2 步骤可视化的数据源
)
```

## 三、四个必须理解的点(面试 + 调坑都靠它)

1. **agent_scratchpad**:Agent 的"草稿纸",历史 Thought/Action/Observation 都拼在这里重新喂给 LLM —— 所以轮次越多 Prompt 越长,Token 成本线性涨,这是 max_iterations 的另一个理由
2. **description 决定选择**:LLM 选工具靠的是 Tool 的 docstring 描述,写得好不好直接决定 Agent 智商(04 课深入)
3. **max_iterations 不是保险丝是熔断器**:到达上限 AgentExecutor 返回"Agent stopped due to max iterations",前端要友好展示
4. **parsing error**:LLM 没按格式输出时,`handle_parsing_errors=True` 会把错误作为 Observation 喂回去让它自我纠正 —— 观察这个过程本身就是最好的 Prompt 工程课

## 四、System Prompt 的角色设定

上面模板里"你是一个资深 DevOps 工程师"不是客套 —— 角色设定显著影响输出质量(提示工程矩阵:Role / Few-Shot / Output Format / CoT)。code_review 场景的完整 Prompt 还要加:

- **Output Format 约束**:"Final Answer 必须是 JSON,字段:verdict(approve|request_changes|reject)、issues[...]、summary"
- **Few-Shot**:给 1~2 个正确输出的示例
- 配合 `PydanticOutputParser` 把 JSON 解析成 `ReviewReport`(F1.3 验收标准)

## 五、验收清单

- [ ] 问"帮我看看 my-service 容器状态",能观察到 Thought→Action(docker_ps)→Observation→Final
- [ ] 故意问需要 10+ 步的问题,验证 max_iterations 熔断
- [ ] 用 structlog 记录每轮迭代,能看到完整推理链
- [ ] 统计一次对话的 Token 消耗(响应 usage 字段),写进学习笔记(F1.x 成本认知)
