import { describe, it, expect } from "vitest";
import {
  checkNode,
  checkOpencli,
  checkPython,
  checkCliHub,
  runDiagnostics,
  type CheckResult,
} from "../src/doctor.js";

describe("doctor diagnostics", () => {
  it("checkNode returns ok status with version", () => {
    const result = checkNode();
    expect(result.name).toBe("node");
    expect(result.status).toBe("ok");
    expect(result.version).toMatch(/^v?\d+\./);
  });

  it("checkPython returns status", () => {
    const result = checkPython();
    expect(result.name).toBe("python");
    expect(["ok", "error"]).toContain(result.status);
    if (result.status === "error") {
      expect(result.fix).toBeTruthy();
    }
  });

  it("checkOpencli returns status", () => {
    const result = checkOpencli();
    expect(result.name).toBe("opencli");
    expect(["ok", "error"]).toContain(result.status);
  });

  it("checkCliHub returns status", () => {
    const result = checkCliHub();
    expect(result.name).toBe("cli-hub");
    expect(["ok", "error"]).toContain(result.status);
  });

  it("runDiagnostics returns all checks", () => {
    const results = runDiagnostics();
    expect(results.length).toBe(4);
    const names = results.map((r) => r.name);
    expect(names).toContain("node");
    expect(names).toContain("python");
    expect(names).toContain("opencli");
    expect(names).toContain("cli-hub");
  });

  it("every check has required fields", () => {
    for (const r of runDiagnostics()) {
      expect(r.name).toBeTruthy();
      expect(["ok", "warning", "error"]).toContain(r.status);
      if (r.status === "ok") {
        expect(r.version).toBeTruthy();
      }
    }
  });
});
