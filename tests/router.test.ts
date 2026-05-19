import { describe, it, expect } from "vitest";
import { resolveTarget } from "../src/router.js";

describe("resolveTarget", () => {
  it('routes "browser" to opencli browser', () => {
    const plan = resolveTarget("browser", ["open"], false);
    expect(plan.command).toBe("opencli");
    expect(plan.args).toEqual(["browser", "open"]);
    expect(plan.backend).toBe("opencli");
  });

  it("routes target to cli-anything when installed", () => {
    const plan = resolveTarget("blender", ["--json", "scene", "info"], true);
    expect(plan.command).toBe("cli-anything-blender");
    expect(plan.args).toEqual(["--json", "scene", "info"]);
    expect(plan.backend).toBe("cli-anything");
  });

  it("routes target to opencli when cli-anything not installed", () => {
    const plan = resolveTarget("hackernews", ["top", "-f", "json"], false);
    expect(plan.command).toBe("opencli");
    expect(plan.args).toEqual(["hackernews", "top", "-f", "json"]);
    expect(plan.backend).toBe("opencli");
  });

  it("routes unknown target to opencli as fallback", () => {
    // Unknown targets fall through to opencli, which handles its own errors
    const plan = resolveTarget("nonexistent", [], false);
    expect(plan.command).toBe("opencli");
    expect(plan.args).toEqual(["nonexistent"]);
    expect(plan.backend).toBe("opencli");
  });

  it("prefers cli-anything over opencli when both could match", () => {
    const plan = resolveTarget("blender", [], true);
    expect(plan.backend).toBe("cli-anything");
  });
});
