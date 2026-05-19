---
name: super-cli
description: >-
  统一 CLI 路由器。当需要操控网站(bilibili/zhihu/twitter等)、
  浏览器、Electron应用、或桌面GUI软件(Blender/GIMP等)时使用。
  先运行 super-cli list -f json 发现所有可用目标。
---

# super-cli

## 快速开始

```bash
super-cli list -f json           # 发现所有可用目标
super-cli <target> --help        # 查看目标的具体命令
super-cli <target> [args] -f json  # 标准调用
```

## 关键规则

- 始终使用 `-f json` 获取结构化输出
- 目标不确定时：`super-cli list | grep <关键词>`
- 环境异常时：`super-cli doctor -f json`

## 创建新 CLI 目标

```bash
super-cli make <网站URL或GitHub地址>
```

## 约束

- 浏览器操控需 Chrome 扩展（`super-cli doctor` 检查）
- 桌面软件需已安装 + Python 3.10+
- 桌面 CLI 安装：`cli-hub install <target>`
