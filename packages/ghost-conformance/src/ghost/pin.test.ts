import { describe, expect, test } from "vitest";

import { clientVersion, unsupportedGhost } from "./pin.ts";

describe("clientVersion", () => {
  test("is the major and minor the client sends", () => {
    expect(clientVersion("6.72.3")).toBe("v6.72");
  });

  test("refuses a major the client doesn't support, saying so", () => {
    expect(() => clientVersion("7.0.0")).toThrow("Ghost 7 isn't supported by the client yet");
  });
});

describe("unsupportedGhost", () => {
  test("is undefined for Ghost 6", () => {
    expect(unsupportedGhost("6.0.0")).toBeUndefined();
  });

  test("explains why another major can't run", () => {
    expect(unsupportedGhost("7.1.0")).toMatch(/^Ghost 7 isn't supported by the client yet/);
  });
});
