/**
 * 聚合 OpenCLI 和 CLI-Anything 目标列表。
 *
 * @param opencliTargets 来自 OpenCLI 的 target 列表
 * @param cliAnythingRegistry CLI-Anything registry 条目
 */
export function aggregateTargets(opencliTargets, cliAnythingRegistry) {
    const targets = [...opencliTargets];
    for (const entry of cliAnythingRegistry) {
        targets.push({
            name: entry.name,
            type: "desktop",
            backend: "cli-anything",
            description: entry.description,
            installed: false, // Runtime detection via which() happens in list command
            installCmd: entry.install_cmd,
        });
    }
    return targets;
}
