# super-cli unified product brainstorm

> Date: 2026-05-18
> Status: requirements clarified, revised after review

## 需求摘要

`super-cli` 是一个**极简 CLI 路由器**，作为统一入口转发命令到 OpenCLI 或 CLI-Anything 后端。

核心定位：**路由器，不是运行时管家。**

```bash
npm install -g super-cli
super-cli list              # 发现可用目标
super-cli doctor -f json    # 检查环境
super-cli <target> [args]   # 自动路由到正确后端
super-cli make <source>     # 为新目标生成 CLI
```

## 产品边界（关键约束）

### super-cli 做的事

- **路由**：解析 target 名称，转发到 OpenCLI 或 `cli-anything-<target>` 子进程
- **发现**：`list` 聚合两个后端的可用目标（读 registry + 运行时扫描）
- **诊断**：`doctor` 检测 Node/Python/OpenCLI/CLI-Anything 环境，输出结构化状态
- **生成**：`make` 分类 source 类型，委托给上游的 authoring 工具

### super-cli 不做的事

- **不管理 Python 环境**：检测 Python 是否可用，不可用就给出安装指引，不替用户装
- **不 lazy install harness**：安装由用户 `cli-hub install <target>` 或 `pip install` 完成，或由 AI Agent 通过 bash 自行完成
- **不内置 CLI-Anything 的 Skills**：不引入 57 个 skill description，避免上下文炸弹
- **不重写任何上游代码**：OpenCLI 保持 npm 依赖，CLI-Anything 的 Python harness 保持 Python
- **不做 JSON output normalization**：透传后端原始输出

## 技术栈决策

| 维度 | 决策 | 理由 |
|------|------|------|
| 主语言 | **纯 TypeScript** | OpenCLI 是 TS/Node 生态，super-cli 只写路由层 |
| Python | 用户运行时依赖 | CLI-Anything harness 需要 Python，但不是 super-cli 管理的对象 |
| 安装管理 | 委托 cli-hub | CLI-Anything 自带 `cli-hub install` 包管理器，不重复造轮子 |
| 包格式 | npm 单包 | 一个 `super-cli` bin，OpenCLI 作为 npm dependency |

## CLI-Anything 集成策略

**不引入 57 个 Skills，只引入 registry 数据。**

| 组件 | 引入方式 | 理由 |
|------|---------|------|
| `registry.json` | 内置快照到 `registries/` | `list` 命令的数据源，~60 条目标信息 |
| `cli-hub` | 运行时依赖 | 用户通过 `cli-hub install <name>` 安装 harness |
| Python harness | 用户自行 pip install | super-cli 不管理，`doctor` 检测并提示 |
| 57 个 Skills | **不引入** | 57 条 description = 3000-5000 tokens 常驻，上下文炸弹 |
| Pi Extension | **不引入** | 之前分析已确认砍掉 |

### list 的数据来源

```
super-cli list:
  ├── OpenCLI targets → 读取 OpenCLI adapter manifest（通过 npm dependency 本地路径）
  └── CLI-Anything targets → 读取内置 registry.json 快照
```

### target 路由逻辑

```
super-cli <target> [args]:
  1. which("cli-anything-<target>") 存在? → exec("cli-anything-<target>", args)
  2. 否则 → exec("opencli", [target, ...args])
  3. 都失败 → 报错 + 提示 super-cli list / cli-hub install
```

## AI Agent 发现机制

新创建的 CLI 不需要更新 SKILL.md。发现靠三层渐进式加载：

```
Layer 0 — SKILL.md description（始终在上下文，~100 bytes）
  → 告诉 Agent "何时用" super-cli

Layer 1 — super-cli list -f json（按需 bash 调用）
  → 动态反映当前系统已安装的所有 target

Layer 2 — super-cli <target> --help（运行时获取）
  → 精确的子命令和参数，零 skill 成本
```

SKILL.md description 只负责"何时触发"，不负责"有什么可用"。

## 用户体验目标

1. 产品名：`super-cli`
2. 安装：`npm install -g super-cli`（自动带上 OpenCLI 作为依赖）
3. 命令：`list` / `doctor` / `<target>` / `make`（4 个以内）
4. 用户前提：Node.js（必须）+ Python 3.10+（可选，桌面软件需要）
5. AI Agent 前提：只读一个 SKILL.md，通过 `list` + `--help` 发现一切

## 非目标

1. 不重写 OpenCLI adapter
2. 不重写 CLI-Anything Python harness
3. 不做 Python 环境管理器
4. 不做 Pi extension
5. 不引入 CLI-Anything 的 57 个 Skills

## 已决策项

1. super-cli 是路由器，不是运行时管家
2. 纯 TypeScript 实现（约 500-800 行）
3. CLI-Anything 集成 = subprocess 转发 + registry.json 数据
4. SKILL.md 控制在 40 行以内
5. 不托管 Python 环境，`doctor` 检测 + 提示

## 开放问题

1. OpenCLI 的 npm 包名、bin 路径、license —— 需查官方确认
2. OpenCLI adapter manifest 的发现机制（API/命令/文件）—— 需查源码
3. `make` 的 MVP 行为：只分类 + 打印指引，还是尝试调用上游 authoring 命令？
4. registry.json 更新策略：随 super-cli 版本发布，还是运行时从 GitHub 拉取？
