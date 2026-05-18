# SuperCLI

**一个 Pi Skill 聚合层，让 Agent 统一掌握在线和离线世界的 CLI 工具。**

## 是什么

SuperCLI 不是一个可执行程序。它是一个轻量的 Skill 索引，告诉 Pi Agent 两个现有工具的存在和选择逻辑：

| 领域 | 工具 | 语言 | 安装 |
|------|------|------|------|
| 在线世界（网站、浏览器、Electron） | [OpenCLI](https://github.com/jackwener/opencli) | TypeScript | `npm install -g @jackwener/opencli` |
| 离线世界（桌面 GUI 软件） | [CLI-Anything](https://github.com/HKUDS/CLI-Anything) | Python | `pip install cli-anything-<software>` |

## 为什么不合并代码

详细分析见 [`docs/report/`](docs/report/)。核心结论：

1. **零功能重叠** — OpenCLI 管在线，CLI-Anything 管离线，互补不冲突
2. **技术栈不同** — TypeScript vs Python，强行统一代价大、收益零
3. **按需安装** — 用户只需安装自己用得到的部分
4. **极简原则** — 非必要，不增溢

## 使用

### 安装 Skill 索引（给 Pi Agent 用）

```bash
# 方式一：直接复制到 Pi skills 目录
cp -r skills/supercli-index ~/.pi/agent/skills/

# 方式二：在 Pi 的 settings.json 里添加路径
# "skills": ["~/code/super-cli/skills"]
```

### 安装 OpenCLI Skills

```bash
npx skills add jackwener/opencli -g -y
```

### 安装 CLI-Anything Skills

```bash
# 按需安装单个软件的 skill
npx skills add HKUDS/CLI-Anything --skill cli-anything-blender -g -y
```

### 安装工具本体

```bash
# 在线工具
npm install -g @jackwener/opencli
opencli doctor

# 离线工具（按需）
pip install cli-anything-blender
pip install cli-anything-gimp
```

## 项目结构

```
super-cli/
├── skills/
│   └── supercli-index/SKILL.md    # Agent 索引 Skill
├── docs/
│   └── report/                    # 分析报告
│       ├── cli-anything-pi-analysis.md
│       ├── opencli-pi-merge-analysis.md
│       └── opencli-typescript-merge-feasibility.md
└── README.md
```

## 设计决策

- **不放源码** — OpenCLI 和 CLI-Anything 各自独立维护
- **不做桥接** — Agent 通过 bash 调用两个工具，不需要胶水代码
- **不统一入口** — `opencli` 和 `cli-anything-*` 保持各自的命令空间
- **只做索引** — 一个 30 行的 SKILL.md 告诉 Agent 何时用哪个

## License

SuperCLI 本身是文档和索引，无代码。引用的工具各自有独立 License：
- OpenCLI: Apache-2.0
- CLI-Anything: Apache-2.0
