/**
 * 路由 target 到正确后端。
 *
 * @param target    目标名
 * @param args      传递给后端的参数
 * @param cliAnythingInstalled  cli-anything-<target> 是否在 PATH 中
 */
export function resolveTarget(target, args, cliAnythingInstalled) {
    // 1. "browser" 保留字 → opencli browser
    if (target === "browser") {
        return { command: "opencli", args: ["browser", ...args], backend: "opencli" };
    }
    // 2. 桌面软件优先：如果 cli-anything-<target> 已安装
    if (cliAnythingInstalled) {
        return {
            command: `cli-anything-${target}`,
            args,
            backend: "cli-anything",
        };
    }
    // 3. 转发给 OpenCLI（OpenCLI 自身会处理未知 target 的错误）
    return { command: "opencli", args: [target, ...args], backend: "opencli" };
}
