import { describe, it, expect } from "vitest";
import { parse } from "../src/cli.js";

describe("parse", () => {
  it("empty args returns help", () => {
    expect(parse([])).toEqual({ command: "help", args: [] });
  });

  it("--help returns help", () => {
    expect(parse(["--help"])).toEqual({ command: "help", args: [] });
  });

  it("-h returns help", () => {
    expect(parse(["-h"])).toEqual({ command: "help", args: [] });
  });

  it("list returns list command", () => {
    expect(parse(["list"])).toEqual({ command: "list", args: [] });
  });

  it("list --type web returns list command with args", () => {
    expect(parse(["list", "--type", "web"])).toEqual({
      command: "list",
      args: ["--type", "web"],
    });
  });

  it("doctor returns doctor command", () => {
    expect(parse(["doctor"])).toEqual({ command: "doctor", args: [] });
  });

  it("make returns make command", () => {
    expect(parse(["make", "https://example.com"])).toEqual({
      command: "make",
      args: ["https://example.com"],
    });
  });

  it("unknown command routes as target", () => {
    expect(parse(["hackernews", "top", "-f", "json"])).toEqual({
      command: "target",
      target: "hackernews",
      args: ["top", "-f", "json"],
    });
  });

  it("browser routes as target", () => {
    expect(parse(["browser", "open"])).toEqual({
      command: "target",
      target: "browser",
      args: ["open"],
    });
  });
});
