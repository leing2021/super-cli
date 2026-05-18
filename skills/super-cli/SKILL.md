---
name: super-cli
description: >-
  把任何东西变成 CLI。网站用 opencli，桌面软件用 cli-anything-*，
  用户不需要关心背后是哪个工具。Use when the agent needs to operate
  any website, browser, Electron app, or desktop GUI software — super-cli
  routes to the right backend automatically.
---

# SuperCLI — 把任何东西变成 CLI

SuperCLI 是一个统一入口，让 Agent 用一套命令操控任何外部软件或网站。

## 前提条件

SuperCLI 依赖两个后端工具（至少装一个）：

```bash
# 在线后端（网站、浏览器、Electron）
npm install -g @jackwener/opencli

# 离线后端（桌面 GUI 软件，按需安装）
pip install cli-anything-<software>
```

Agent 应先运行 `super-cli doctor` 检查哪些后端可用。

## 命令

### super-cli list — 列出所有可操控目标

```bash
super-cli list              # 列出全部（网站 + 桌面软件）
super-cli list --type web   # 只列网站
super-cli list --type app   # 只列桌面软件
super-cli list -f json      # JSON 输出
super-cli list | grep -i blender  # 搜索
```

### super-cli doctor — 检查后端状态

```bash
super-cli doctor
```

输出：哪些后端已安装、版本、可用命令数。

### super-cli \<target\> [args...] — 操控目标

Agent 不需要区分目标类型，直接用目标名调用：

```bash
# 网站（自动路由到 opencli）
super-cli hackernews top -f json
super-cli bilibili hot --limit 5 -f json

# 浏览器操控（路由到 opencli browser）
super-cli browser <session> open https://example.com

# 桌面软件（自动路由到 cli-anything-*）
super-cli blender --json scene info
super-cli gimp --json layer list
```

路由规则（Agent 不需要知道，但需要理解行为）：
- `browser` → `opencli browser`
- 目标名匹配 opencli 站点 → `opencli <target> <args>`
- 目标名匹配 cli-anything-* → `cli-anything-<target> <args>`
- 未匹配 → 报错并给出安装提示

### super-cli make \<source\> — 为新目标生成 CLI

```bash
# 为一个 GitHub 开源项目生成桌面 CLI（CLI-Anything harness）
super-cli make https://github.com/blender/blender

# 为一个网站生成适配器（OpenCLI adapter）
super-cli make https://xiaohongshu.com
```

Agent 收到此命令后：
1. 判断 source 是网站 URL 还是软件源码
2. 网站URL → 使用 opencli-adapter-author skill 的流程
3. 软件源码 → 使用 cli-anything harness 方法论的流程
4. 生成完毕后 `super-cli list` 应出现新目标

## 关键约束

- 所有命令优先使用 `-f json` 或 `--json` 获取结构化输出
- 浏览器操控需要 Chrome 扩展 + daemon（运行 `super-cli doctor` 诊断）
- 桌面软件需要对应软件已安装在系统上

## 故障排除

```bash
super-cli doctor                    # 检查后端状态
opencli doctor                      # 单独检查浏览器桥接
which opencli                       # 确认 opencli 已安装
pip list | grep cli-anything        # 确认桌面 CLI 已安装
```
