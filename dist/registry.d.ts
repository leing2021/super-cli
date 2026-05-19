export interface Target {
    name: string;
    type: "web" | "desktop";
    backend: "opencli" | "cli-anything";
    description: string;
    installed: boolean;
    installCmd?: string;
}
export interface CliAnythingEntry {
    name: string;
    description: string;
    entry_point: string;
    category?: string;
    install_cmd: string;
}
export interface OpencliTarget {
    name: string;
    type: "web" | "desktop";
    backend: "opencli";
    description: string;
    installed: boolean;
}
/**
 * 聚合 OpenCLI 和 CLI-Anything 目标列表。
 *
 * @param opencliTargets 来自 OpenCLI 的 target 列表
 * @param cliAnythingRegistry CLI-Anything registry 条目
 */
export declare function aggregateTargets(opencliTargets: OpencliTarget[], cliAnythingRegistry: CliAnythingEntry[]): Target[];
