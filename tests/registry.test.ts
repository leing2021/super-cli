import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// We'll test the registry directly from the fixture file
const registryPath = resolve(
  __dirname,
  "../registries/cli-anything.json"
);
const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

describe("CLI-Anything registry", () => {
  it("contains known desktop CLI targets", () => {
    const names = registry.map((r: any) => r.name);
    expect(names).toContain("blender");
    expect(names).toContain("gimp");
  });

  it("all entries have required fields", () => {
    for (const entry of registry) {
      expect(entry.name).toBeTruthy();
      expect(entry.entry_point).toBeTruthy();
      expect(entry.entry_point).toMatch(/^cli-anything-/);
      expect(entry.install_cmd).toBeTruthy();
    }
  });

  it("all entry points follow naming convention", () => {
    for (const entry of registry) {
      expect(entry.entry_point).toBe(`cli-anything-${entry.name}`);
    }
  });
});

// Test the aggregator function
import { aggregateTargets } from "../src/registry.js";

describe("aggregateTargets", () => {
  it("returns CLI-Anything targets from registry fixture", () => {
    const targets = aggregateTargets([], registry);
    expect(targets.length).toBeGreaterThanOrEqual(6);
    const blender = targets.find((t) => t.name === "blender");
    expect(blender).toBeTruthy();
    expect(blender!.type).toBe("desktop");
    expect(blender!.backend).toBe("cli-anything");
    expect(blender!.installed).toBe(false);
  });

  it("merges OpenCLI and CLI-Anything targets", () => {
    const opencliTargets = [
      {
        name: "hackernews",
        type: "web" as const,
        backend: "opencli" as const,
        description: "Hacker News reader",
        installed: true,
      },
    ];
    const targets = aggregateTargets(opencliTargets, registry);
    expect(targets.length).toBeGreaterThanOrEqual(7);
    const web = targets.filter((t) => t.type === "web");
    const desktop = targets.filter((t) => t.type === "desktop");
    expect(web.length).toBeGreaterThanOrEqual(1);
    expect(desktop.length).toBeGreaterThanOrEqual(6);
  });
});
