import { describe, it, expect } from "vitest";
import { classifySource } from "../src/make.js";

describe("classifySource", () => {
  it("classifies website URL as url type", () => {
    const result = classifySource("https://xiaohongshu.com");
    expect(result.type).toBe("url");
    expect(result.guidance).toContain("OpenCLI adapter");
  });

  it("classifies GitHub repo URL as repo type", () => {
    const result = classifySource("https://github.com/blender/blender");
    expect(result.type).toBe("repo");
    expect(result.guidance).toContain("CLI-Anything");
  });

  it("classifies unknown source", () => {
    const result = classifySource("./local-dir");
    expect(result.type).toBe("unknown");
    expect(result.guidance).toContain("Unknown source type");
  });

  it("classifies http URL as url", () => {
    const result = classifySource("http://example.com");
    expect(result.type).toBe("url");
  });

  it("does not classify github.com main page as repo", () => {
    const result = classifySource("https://github.com");
    expect(result.type).toBe("url"); // just a URL, not a repo path
  });
});
