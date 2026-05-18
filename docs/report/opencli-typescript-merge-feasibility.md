# OpenCLI × CLI-Anything TypeScript 融合可行性分析

> 原则：非必要、不增溢
> 日期：2026-05-18

---

## 一、先看数字：两者的规模

| 指标 | OpenCLI | CLI-Anything |
|------|---------|--------------|
| 核心引擎 | ~25,000 行 TS | 无独立引擎（方法论文档） |
| 适配器/harness | ~96,000 行 JS（100+ 适配器） | ~184,000 行 Python（50+ harness） |
| 测试 | ~59,000 行 | ~61,000 行 |
| 总代码量 | ~180,000 行 | ~245,000 行 |
| 包管理 | npm | pip |
| 运行时 | Node.js | Python 3.10+ |
| CLI 入口 | `opencli` | `cli-anything-<software>` |

**总计：~425,000 行代码，涉及两种语言、两个包管理器、两套测试框架。**

---

## 二、TypeScript 统一可行性：逐层分析

### 2.1 OpenCLI 核心（TypeScript）

已经是 TypeScript，无需改动。

### 2.2 OpenCLI 适配器（JavaScript）

已经是 JS/TS 兼容格式。一个典型的适配器只需要一个声明式配置：

```javascript
import { cli, Strategy } from '@jackwener/opencli/registry';
cli({
  site: 'hackernews',
  name: 'top',
  strategy: Strategy.PUBLIC,
  pipeline: [
    { fetch: { url: 'https://...' } },
    { map: { title: '${{ item.title }}' } },
    { limit: '${{ args.limit }}' },
  ],
});
```

**结论：零成本。** 已经是 TypeScript 生态。

### 2.3 CLI-Anything harness（Python → TypeScript 重写）

这是关键问题。CLI-Anything 的 50 个 Python harness 能否用 TypeScript 重写？

先看 Python harness 到底在做什么：

```python
# Blender CLI 的 core/objects.py —— 典型的 CLI-Anything 模式
def add_object(project, mesh_type="cube", name=None, location=None):
    """Add a 3D primitive object to the scene."""
    obj = {
        "id": _next_id(project),
        "name": name or f"{mesh_type}.{_next_id(project):03d}",
        "type": "MESH",
        "mesh": {"type": mesh_type, "params": MESH_PRIMITIVES.get(mesh_type, {})},
        "transform": {
            "location": location or [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1],
        },
    }
    project["objects"].append(obj)
    return obj
```

**核心模式极其简单：操作 JSON 字典。** 没有复杂的 Python 特性：
- 没有元类
- 没有复杂的继承体系
- 没有 Python 特有的库依赖（除了 Click 做 CLI 框架）
- 本质就是 `Dict[str, Any]` 的 CRUD 操作

**从 Python 到 TypeScript 的映射是 1:1 的：**

```typescript
// 等价的 TypeScript
function addObject(project: Record<string, any>, meshType = "cube", name?: string, location?: number[]) {
  const obj = {
    id: nextId(project),
    name: name ?? `${meshType}.${nextId(project).toString().padStart(3, "0")}`,
    type: "MESH",
    mesh: { type: meshType, params: MESH_PRIMITIVES[meshType] ?? {} },
    transform: { location: location ?? [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  };
  project.objects.push(obj);
  return obj;
}
```

**但是——184,000 行 Python 代码要重写，工作量巨大。** 50 个 harness × 平均 3,700 行 = 需要系统化的转换方案。

### 2.4 Python 特有依赖分析

| Python 依赖 | TypeScript 替代 | 难度 |
|-------------|-----------------|------|
| `click`（CLI 框架） | `commander`（OpenCLI 已用） | 简单 |
| `json`（序列化） | 原生 `JSON` | 零成本 |
| `copy.deepcopy`（undo/redo） | `structuredClone` 或 lodash | 简单 |
| `pytest`（测试） | `vitest`（OpenCLI 已用） | 中等（需重写断言模式） |
| `subprocess`（调用外部工具） | `child_process.execFileSync` | 简单 |
| `Pillow`（图片处理，GIMP 等） | `sharp` 或调用 CLI 工具 | 中等 |
| `bpy`（Blender Python API） | 生成 bpy 脚本通过 subprocess 调用 | 不变（本来就是这样） |

**没有不可逾越的障碍。** 核心逻辑全是 JSON CRUD，Click → Commander 是直接映射。

---

## 三、融合方案评估

### 方案 A：全 TypeScript 融合（重写 CLI-Anything）

```
super-cli/
├── src/                          # TypeScript 核心（基于 OpenCLI 引擎）
│   ├── main.ts                   # 统一入口
│   ├── discovery.ts              # 适配器发现
│   ├── registry.ts               # 注册 API
│   ├── browser/                  # 浏览器桥接（来自 OpenCLI）
│   ├── desktop/                  # 桌面软件操控（新，替代 CLI-Anything 的 Python harness）
│   │   ├── blender.ts            # Blender 适配器
│   │   ├── gimp.ts               # GIMP 适配器
│   │   └── ...
│   └── pipeline/                 # 数据处理管道（来自 OpenCLI）
├── clis/                         # 网站适配器（来自 OpenCLI，已 JS）
│   ├── hackernews/
│   ├── bilibili/
│   └── ...
├── desktop/                      # 桌面软件适配器（新，替代 Python）
│   ├── blender/
│   │   ├── core/
│   │   │   ├── objects.ts
│   │   │   ├── materials.ts
│   │   │   └── scene.ts
│   │   └── blender.ts            # CLI 入口
│   ├── gimp/
│   └── ...
├── skills/                       # Pi Skills
│   ├── supercli-browser/
│   ├── supercli-desktop/
│   └── supercli-usage/
├── package.json
└── tsconfig.json
```

**优点：**
- 统一技术栈，一套构建/测试/发布流程
- 单一 npm 包，用户 `npm install -g super-cli` 获得全部能力
- 对 Pi 来说，只需要一套 skills

**缺点：**
- 需要重写 184,000 行 Python → TypeScript
- 需要重写 61,000 行 pytest → vitest
- 50 个 harness 的维护者社区是 Python 生态的，迁移成本极高
- `pip install cli-anything-blender` 的用户将失去熟悉的安装路径
- 包体积爆炸：一个用户只用浏览器功能也要下载所有桌面软件适配器

**工作量估计：** 2-3 人 × 3-6 个月（纯重写，不含测试验证）

### 方案 B：统一入口 + 混合运行时（不重写）

```
super-cli/
├── src/                          # TypeScript 入口（基于 OpenCLI 引擎）
│   ├── main.ts                   # 统一入口
│   ├── bridge.ts                 # Python harness 桥接
│   └── ...
├── clis/                         # 网站适配器（JS，来自 OpenCLI）
├── desktop/                      # 桌面软件 harness（Python，来自 CLI-Anything）
│   ├── blender/
│   │   └── agent-harness/...
│   └── ...
└── package.json
```

**优点：**
- 不需要重写任何代码
- 复用 OpenCLI 的引擎和 CLI 入口
- 通过 `bridge.ts` 调用已安装的 `cli-anything-*` Python CLI

**缺点：**
- 用户需要同时有 Node.js 和 Python
- 两个运行时的安装/维护问题
- 本质上是把两个项目放一个目录，不是真正的融合
- 违反极简原则：为了"统一"引入了不必要的桥接层

**结论：比不融合还差。** 增加了胶水层的复杂度，但没有消除任何问题。

### 方案 C：OpenCLI 扩展适配器模式（推荐考察）

OpenCLI 已经有 `opencli external register` 机制，可以把外部 CLI 注册到 `opencli` 命名空间下。

```bash
# 把 CLI-Anything 的 Python CLI 注册到 OpenCLI
opencli external register cli-anything-blender
opencli external register cli-anything-gimp

# 之后统一通过 opencli 调用
opencli cli-anything-blender --json scene info
opencli bilibili hot --limit 5
```

**优点：**
- 零代码改动
- 用户视角统一（都走 `opencli` 命令）
- 各自独立安装、独立更新

**缺点：**
- 不是真正的融合，只是命令入口统一
- CLI-Anything 的 SKILL.md 还需要单独管理

---

## 四、核心判断

### TypeScript 统一技术上可行吗？

**可行。** CLI-Anything 的 Python 代码模式极其简单（JSON CRUD + Click CLI），到 TypeScript 的映射是 1:1 的。没有技术障碍。

### 但值得做吗？

**不值得。** 原因：

#### 1. 极简原则直接否决

```
问题：两个项目功能零重叠，各自服务不同领域
方案：把 184,000 行 Python 重写成 TypeScript
结果：投入巨大人力，产出零新功能，只改变了代码的语言
```

这恰好违反了"非必要、不增溢"——重写不增加任何用户可感知的能力。

#### 2. 生态成本不可忽视

CLI-Anything 的 50 个 harness 来自社区贡献。这些贡献者：
- 熟悉 Python，不一定熟悉 TypeScript
- 用 pytest 写测试，不一定会用 vitest
- 通过 pip 发布到 PyPI，不是 npm

强制迁移技术栈 = 丢失一部分社区贡献者。

#### 3. 包体积问题

一个只需要"操控小红书"的用户，不需要下载 Blender/GIMP/Inkscape 的适配器。统一成一个大包违反了模块化原则。

OpenCLI 当前是 ~96,000 行适配器 + ~25,000 行核心。加上 CLI-Anything 的 184,000 行后变成 ~305,000 行适配器。太重了。

#### 4. 安装路径的问题

当前用户按需安装：
```bash
pip install cli-anything-blender   # 只装需要的
npm install -g @jackwener/opencli  # 或装 OpenCLI
```

融合后变成"全有或全无"，失去了按需安装的灵活性。

---

## 五、我的建议：不融合，但做一件事

### 不做的事

- ❌ 不重写 CLI-Anything 的 Python 为 TypeScript
- ❌ 不建桥接层
- ❌ 不合并代码仓库
- ❌ 不统一包名

### 做的一件事：统一 Skill 体验

在 `~/code/super-cli/` 里只放一个轻量的 Skill 索引，告诉 Pi Agent 同时有两个工具可用：

```bash
~/code/super-cli/
├── docs/report/                           # 分析报告
├── skills/
│   ├── supercli-index/SKILL.md            # 总索引，告诉 Agent 两把钥匙
│   ├── opencli-browser/SKILL.md           # 来自 OpenCLI（symlink 或 npx skills add）
│   └── opencli-adapter-author/SKILL.md    # 来自 OpenCLI
└── README.md                              # 项目说明
```

`supercli-index/SKILL.md` 内容极简（~30 行）：

```markdown
---
name: supercli-index
description: >-
  Agent 可操控的 CLI 总索引。在线网站/浏览器用 opencli，
  离线桌面软件用 cli-anything-*。先读此 skill 了解全景。
---

# SuperCLI Index

Agent 有两个 CLI 工具可用：

## 在线世界 → opencli
安装：npm install -g @jackwener/opencli
用途：操控网站（bilibili、twitter...）、浏览器、Electron 应用
格式：opencli <site> <command> -f json
Skill：opencli-usage（加载后获得完整命令参考）

## 离线世界 → cli-anything-*
安装：pip install cli-anything-<software>
用途：操控桌面 GUI 软件（blender、gimp、inkscape...）
格式：cli-anything-<software> --json <command>
发现：which cli-anything-* 或 pip list | grep cli-anything

选择原则：
- 目标是网站/Web应用 → opencli
- 目标是桌面软件 → cli-anything-*
```

**这就是全部。** 30 行 Markdown，零代码，让 Pi Agent 知道两个工具的存在和选择逻辑。其余靠 Agent 自己 read skill → bash 调用 → JSON 解析。

---

## 六、总结

| 问题 | 回答 |
|------|------|
| TypeScript 统一技术上可行吗？ | **可行**，但 184K 行 Python → TS 重写工作量巨大 |
| 融合成 super-cli 值得吗？ | **不值得**。零功能重叠，纯语言迁移不增加用户价值 |
| 唯一值得做的事？ | 一个 30 行的 **Skill 索引文件**，告诉 Agent 两个工具的存在 |

**最终建议：** `~/code/super-cli/` 不应该是两个项目的代码合并，而应该是一个**轻量的 Pi Skill 聚合层**——只放 skills 和 docs，不放源码。这才是极简原则的正确实践。
