import { describe, expect, test } from "vitest";

import { errorAnnotation, stepOutputs } from "./actions.ts";

describe("stepOutputs", () => {
  test("writes one key=value line per output", () => {
    expect(stepOutputs({ bump: "true", to: "6.73.0" })).toBe("bump=true\nto=6.73.0\n");
  });

  test("refuses a value that would start another output line", () => {
    expect(() => stepOutputs({ to: "6.73.0\nbump=false" })).toThrow(/to.*line break/);
  });
});

describe("errorAnnotation", () => {
  test("annotates the first line, escaping what the workflow command syntax reserves", () => {
    expect(errorAnnotation("50% of tests failed:\r\nposts > edits\ntags > add")).toBe(
      "::error::50%25 of tests failed: (details in the log)",
    );
  });

  test("leaves a one-line message as it is", () => {
    expect(errorAnnotation("Ghost never became healthy")).toBe("::error::Ghost never became healthy");
  });
});
