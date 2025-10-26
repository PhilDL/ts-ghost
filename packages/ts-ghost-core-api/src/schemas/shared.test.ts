import { describe, expect, test } from "vitest";

import { apiVersionsSchema } from "./shared";

describe("Api version schema", () => {
  test("should accept valid version", () => {
    expect(apiVersionsSchema.parse("v5.0")).toBe("v5.0");
    expect(apiVersionsSchema.parse("v6.0")).toBe("v6.0");
  });
  test("should not accept invalid version", () => {
    expect(() => apiVersionsSchema.parse("v4.0")).toThrow();
    expect(() => apiVersionsSchema.parse("v7.0")).toThrow();
  });
});
