# CLI-Anything × Pi 配合分析

> 原则：非必要、不增溢
> 日期：2026-05-18

---

## 一、各自定位

**CLI-Anything** 做两件事：
- **方法论**（HARNESS.md，747行）：告诉 Agent 如何把任何 GUI 软件变成 CLI
- **产物库**（50+ 已生成 CLI + 114 个 SKILL.md）：Blender/GIMP/Inkscape 等已被包装成可 pip 安装的 Python CLI，每个都附带 SKILL.md 供 Agent 发现

**Pi** 的核心能力：
- **Skills**（Markdown 渐进式披露）——只有标题+描述常驻上下文，完整内容按需 read
- **Extensions**（TypeScript）——注册工具、命令、事件钩子
- 极简哲学：不做 MCP、不做 sub-agent、不做 plan mode、不做 TODO

---

## 二、现有集成方式及问题

CLI-Anything 目前为 Pi 提供了两条集成路径：

| 路径 | 形式 | 问题 |
|------|------|------|
| **Pi Extension** | `.pi-extension/cli-anything/index.ts` 注册 5 个 `/` 命令 | **严重违反极简原则** |
| **Skills** | `skills/` 下 114 个 `SKILL.md` | 方向正确，但冗余 |

### Pi Extension 的核心问题

```typescript
// index.ts 的核心逻辑——每次命令执行时干的事
function injectCommandContext(pi, commandName, commandMdPath, userArgs) {
    const harnessMd = readAsset("HARNESS.md");  // 747 行
    const commandMd = readAsset("commands", commandMdPath);
    const message = buildCommandMessage(...);   // 拼成一个超级大消息
    pi.sendUserMessage(message);                // 塞进 session
}
```

这违反了 Pi 的极简原则：

1. **上下文炸弹** — 用户打一个 `/cli-anything ./gimp`，直接往 session 里注入 747 行方法论 + 命令 spec + 路径映射规则。这不是 extension 该干的——extension 应该是轻量事件拦截器，不是 workflow engine。

2. **和 Skills 的能力重叠** — `skills/` 下已经有 114 个 SKILL.md，按 Pi 的 progressive disclosure 模式工作得很好。Extension 又重复做一遍，纯粹冗余。

3. **Pi 的设计哲学明确反对这种模式** — README 里说："No plan mode. No sub-agents. Write plans to files, or build it with extensions." Extension 应该提供简单的钩子和工具，而不是把整个工作流引擎塞进上下文。

---

## 三、配合度评估

| 维度 | 评分 | 说明 |
|------|------|------|
| **技能层：产物 CLI 作为 Pi Skills** | ⭐⭐⭐⭐⭐ | 完美契合。Agent 看到 `cli-anything-blender` skill，read 后安装使用 |
| **技能层：HARNESS 作为 Skill** | ⭐⭐⭐⭐ | 可以做，但需精简 |
| **Extension 层：5 个 / 命令** | ⭐ | 设计和哲学层面的冲突 |
| **语法生态一致性** | ⭐⭐ | Python CLI vs TypeScript extension，割裂 |

### 默契的地方

- CLI-Anything 生成的 CLI 天然支持 `--json` 输出 → Agent 通过 bash 工具调用，拿到结构化 JSON 解析，完美
- SKILL.md 格式和 Pi 的 skill 规范兼容
- `cli-hub` 的 `install` 命令让 Agent 能自主发现和安装 CLI

### 不默契的地方

- Extension 把 HARNESS.md 和命令 spec 拼成巨型 user message，跟 Pi 的 progressive disclosure 理念背道而驰
- Pi 本身宣扬"No MCP"、"No sub-agents"，但 CLI-Anything extension 试图在 Pi 内部塞一个 GUI-to-CLI 的完整工程流水线——这相当于绕过了 Pi 的极简约束，在 extension 层面重建了一个重型工作流

---

## 四、可能的使用场景（按必要程度排序）

| 场景 | 必要程度 | 说明 |
|------|----------|------|
| **Agent 用已生成的 CLI 操控 GUI 软件** | 高 | 这是 CLI-Anything 的核心价值。Agent 在 Pi 里通过 bash 调用 `cli-anything-blender` 渲染 3D 场景，无需 GUI |
| **Agent 自主发现并安装 CLI** | 中高 | 通过 `cli-hub` 或 skill 描述，Agent 知道有这些 CLI 可用，自行 pip install |
| **用户通过 Skill 引导 Agent 构建新 CLI** | 中 | 如果你想给新软件做 CLI harness，用一个精简版 HARNESS.md 作为 skill 就够了 |
| **用户通过 Extension 命令一键启动构建** | 低 | `/cli-anything ./foo` 的便利性不值得 747 行上下文的代价 |

---

## 五、改进建议（基于极简原则：非必要、不增溢）

### 建议 1：砍掉 Pi Extension，只保留 Skills

`/cli-anything` 等 5 个命令直接删掉。Extension 目录 `.pi-extension/` 可以完全移除。

**理由**：Skills 已经提供了等价且更好的能力。Skill 按需 read，extension 是一次性上下文炸弹。Pi 的哲学就是拒绝这种模式。

### 建议 2：HARNESS.md 作为一个独立 Skill

在 `skills/` 下新增：

```
skills/cli-anything-harness/SKILL.md
```

内容控制在 **50 行以内**，只需告诉 Agent：
- 如何分析目标软件（找 backend engine、数据模型）
- 标准输出结构
- 参考已有 CLI（给一个示例路径）
- 关键规则（必须支持 `--json`、使用 Click 框架等）

**当前 747 行的 HARNESS.md 是对 Claude Code 等重上下文 Agent 设计的，不适合 Pi 的极简模型。** 精简到 50 行原则：Agent 用 Pi 的 read/bash/edit/write 四件套就能干的事，不需要写在 skill 里，让模型自己推理。

### 建议 3：精简每个 CLI 的 SKILL.md

现有 SKILL.md（如 blender 的）有数百行，包含了完整的命令表格、示例、输出格式说明。对 Pi 来说，Agent 可以：
1. Read SKILL.md 知道有这个 CLI 和基本用法
2. `pip install cli-anything-blender`
3. `cli-anything-blender --help` 获取完整命令列表

所以 SKILL.md 只需包含：名称、一句话描述、安装命令、`--help` 的提示、关键约束（如"必须使用绝对路径"）。

### 建议 4：统一 skill 命名和触发条件

当前 skills 目录下名字形式是 `cli-anything-<software>/SKILL.md`。描述应该清晰说明"何时使用此 skill"——这是 Pi skill 系统的核心触发机制。例如：

> Use when the user needs to create, edit, or render 3D scenes programmatically — modeling, materials, animation, rendering.

---

## 六、结论

CLI-Anything 的产物（50+ CLI harness + SKILL.md）和 Pi 天然默契，但它的 Extension 层是画蛇添足——在 Pi 的极简架构上硬塞了一个 Claude Code 式的工作流引擎。

**砍掉 Extension，精简 Skill，就是最好的配合。** 符合"非必要、不增溢"的原则。
