import type { ExecPlan } from "./runner.js";
/**
 * 路由 target 到正确后端。
 *
 * @param target    目标名
 * @param args      传递给后端的参数
 * @param cliAnythingInstalled  cli-anything-<target> 是否在 PATH 中
 */
export declare function resolveTarget(target: string, args: string[], cliAnythingInstalled: boolean): ExecPlan;
