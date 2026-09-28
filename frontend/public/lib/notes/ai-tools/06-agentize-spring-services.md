---
title: "Agent化企业系统：把Spring服务封装成AI工具"
description: "Java工程师的护城河：把企业内部服务封装成Agent可调用的工具——工具设计规范、权限鉴权、审计治理、失败处理，附端到端示例。"
tags: ["Agent", "Spring AI", "Function Calling", "企业集成", "Java"]
difficulty: "高级"
readTime: 17
order: 6
author: "degang"
createdAt: "2026-09-26"
updatedAt: "2026-09-26"
---

# Agent化企业系统：把Spring服务封装成AI工具

[转型路径](/notes/04-java-ai-transition) 里给这个阶段标了 ⭐，理由只有一句话：**Python 派懂模型但不懂你的业务系统，你两样都懂**。Agent 化企业系统的全部难点——权限、审计、事务、降级——恰好都是 Java 工程师做了十年的事。

先对齐定义：这里的"Agent 化"，指让大模型通过 [Function Calling](/notes/04-agent-function-calling) 调用你已有的 Spring Service（订单、库存、CRM），**在既有权限体系和业务逻辑之内**完成自然语言驱动的任务。不是重写系统，是包一层接口。

## 架构总览：模型只是大脑，Spring 才是身体

```
用户（自然语言）
   │
   ▼
Agent（模型：理解意图、规划步骤、决定调用哪个工具）
   │  Function Calling（结构化调用意图）
   ▼
工具层（本文重点：@Tool 封装 + 鉴权 + 审计）
   │  普通方法调用，同进程/跨服务皆可
   ▼
你的 Spring Service（订单/库存/CRM——业务逻辑、权限体系原封不动）
```

关键设计决策：**模型永远不直接触达数据库和服务**。它只能通过工具层这一道闸，所有治理（鉴权、审计、限流）都做在闸上。

## 工具封装：三件事决定成败

### 1. 用 Spring AI 的 @Tool 注解暴露服务

```java
public class OrderTools {

    private final OrderService orderService;   // 既有服务，直接注入

    @Tool(description = "按订单号查询订单详情，包含状态、金额和物流信息。仅在用户明确提供订单号时使用")
    public OrderDetail getOrder(
            @ToolParam(description = "订单号，格式如 SO-2026-xxxxx") String orderId) {
        return orderService.getDetail(orderId);   // 复用既有逻辑，零改动
    }

    @Tool(description = "取消未发货订单。需要用户二次确认后才能调用")
    public CancelResult cancelOrder(
            @ToolParam(description = "订单号") String orderId,
            @ToolParam(description = "取消原因") String reason) {
        return orderService.cancel(orderId, reason);
    }
}
```

### 2. 描述（description）是给模型看的接口文档

模型完全靠描述来决定"调不调、怎么调"，写法的黄金标准：**写清楚什么时候该用、什么时候不该用、参数从哪来**。

- ❌ `查询订单` —— 模型不知道和"查物流""查售后"怎么区分
- ✅ `按订单号查询订单详情...仅在用户明确提供订单号时使用`
- 参数同理：`orderId` 要说明格式，甚至告诉模型"用户没提供时先反问，不要编造"

### 3. 工具粒度：贴合业务动作，不暴露表操作

- ❌ `executeSql(sql)` / `queryTable("order")` —— 把数据库暴露给模型，权限体系瞬间作废
- ✅ `getOrder` / `cancelOrder` / `applyRefund` —— 一个工具对应一个**业务动作**，语义清晰、权限可挂、审计可查
- 数量控制在单 Agent 10 个以内，更多就按场景拆多 Agent（见 [MCP实战](/notes/04-mcp-in-action) 的同款结论）

## 权限与鉴权：工具层的三道闸

**第一道：工具级权限**。每个工具声明所需权限，调用前校验当前用户有没有：

```java
@Tool(description = "...")
@RequiresPermission("order:cancel")     // 复用你现有的权限框架注解
public CancelResult cancelOrder(...) { ... }
```

**第二道：用户上下文透传**。这是最容易被绕过的坑——模型调工具时，必须带上"是哪个用户在发起"：

```java
// 用 ThreadLocal / Reactor Context 透传当前登录用户，工具内部强制使用
public OrderDetail getOrder(String orderId) {
    UserContext user = UserContext.current();          // 绝不让模型传用户ID参数！
    return orderService.getDetail(orderId, user);      // 行级权限在Service内生效
}
```

**铁律：用户身份永远从会话上下文取，绝不接受模型输出的"当前用户"参数**——否则 Prompt 注入一句"以管理员身份查询"就击穿了整个权限体系。

**第三道：数据行级权限**。工具内部继续走既有的数据权限过滤（"客服只能看分配给自己的订单"），模型层不做任何数据权限判断。

## 审计与治理：让每次自动调用可追责

Agent 的调用是模型自主决定的，审计粒度要比普通接口更细：

```json
{
  "traceId": "req-88213",
  "userId": "u-1002",
  "tool": "cancelOrder",
  "args": {"orderId": "SO-2026-0917", "reason": "用户要求取消"},
  "result": "SUCCESS",
  "costMs": 210,
  "model": "gpt-x",
  "promptVersion": "order-agent-v3"
}
```

三个治理机制：

- **危险操作 human-in-the-loop**：取消订单、退款、审批类工具，先让 Agent 向用户复述操作并确认，确认后才真正执行——实现在工具层（状态机：意图确认 → 用户确认 → 执行），不依赖模型"自觉"
- **调用限流**：同一用户对同一工具的调用频率上限，防止模型陷入循环反复调用
- **幂等设计**：给每个工具调用带 requestId，重试（模型经常重试）不会重复扣款

## 失败处理：模型会犯错，工具层要兜住

模型发起的调用注定包含错误参数、越权请求和不存在的 ID，工具层的返回设计直接决定 Agent 能不能自我纠正：

- **错误返回结构化、说人话**：`{"error": "ORDER_NOT_FOUND", "hint": "请核对订单号格式（SO-YYYY-xxxxx）后重试"}` —— 模型看到 hint 会自己纠正后重试
- **超时与降级**：工具调用超时对模型透明返回"服务暂不可用"，别让它干等；核心工具挂掉时 Agent 应引导用户走人工通道，而不是编造结果
- **事务边界**：跨多个工具调用构成的业务操作（查库存→下单→扣款）不能依赖模型"记得回滚"——要么封装成单个工具在 Service 内走事务，要么在工具层做 Saga 补偿

## 端到端流程：一次真实的订单咨询

```
用户：帮我查一下昨天买的那台咖啡机，然后取消掉。

模型思考 → 没有订单号，需要先查询（没有"昨天的订单"这种模糊查询工具）
模型回复 → "请提供订单号，或我用您最近的订单列表帮您找"（调 listRecentOrders）
用户确认 → 模型调 getOrder(SO-2026-0917) → 返回详情
模型      → "该订单尚未发货，确认取消吗？取消原因？"
用户      → "确认，不想要了"
工具层    → 校验确认状态 ✅ → 校验权限 order:cancel ✅ → 幂等检查 ✅
模型调 cancelOrder → 成功 → 汇总回复用户
全程：4 次模型交互，2 次工具调用，审计日志 2 条
```

注意其中模型做的只是**理解、路由、复述、确认**——所有真正的业务动作都在你的 Spring Service 里发生。

## 上线清单

- [ ] 每个工具有清晰的 description 和参数说明（用真实对话测过模型能否选对工具）
- [ ] 用户上下文透传，无任何工具接受模型输出的身份参数
- [ ] 危险操作有确认状态机，审计日志完整
- [ ] 错误返回结构化带 hint，超时有降级话术
- [ ] 用 [评测集](/notes/06-eval-basics) 覆盖典型任务流和注入攻击用例
- [ ] [成本与调用监控](/notes/07-observability-and-cost) 接入现有告警体系

## 小结

Agent 化企业系统的本质：**把"自然语言"变成一种新的调用入口，而工程治理的重心全部落在工具层**。模型负责理解和决策，Spring 负责权限、事务、审计、降级——分工越清晰，系统越可靠。

这条路上没有魔法，只有你熟悉的工程能力被放到了新入口上。这正是那句话的完整含义：**你不需要变成算法工程师，你需要成为那个懂 AI 的资深工程师。**
