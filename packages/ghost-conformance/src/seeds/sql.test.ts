import { describe, expect, test } from "vitest";

import { ghostId, insert, raw } from "./sql.ts";

describe("insert", () => {
  test("renders one multi-row INSERT with quoted, escaped values", () => {
    const statement = insert("suppressions", [
      { id: "a1", email: "o'brien@x.test", reason: "spam", email_id: null, n: 3, ok: true },
      { id: "a2", email: "back\\slash@x.test", reason: "fail", email_id: raw("@email"), n: 0, ok: false },
    ]);
    expect(statement).toBe(
      "INSERT INTO `suppressions` (`id`, `email`, `reason`, `email_id`, `n`, `ok`) VALUES " +
        "('a1', 'o''brien@x.test', 'spam', NULL, 3, 1), " +
        "('a2', 'back\\\\slash@x.test', 'fail', @email, 0, 0);",
    );
  });

  test("writes dates as UTC DATETIME literals", () => {
    expect(insert("t", [{ at: new Date("2026-01-02T03:04:05.678Z") }])).toBe(
      "INSERT INTO `t` (`at`) VALUES ('2026-01-02 03:04:05');",
    );
  });

  test("refuses rows whose columns differ", () => {
    expect(() => insert("t", [{ a: 1 }, { b: 2 }])).toThrow(/columns/);
  });
});

describe("ghostId", () => {
  test("is a 24-character hex ObjectId", () => {
    expect(ghostId()).toMatch(/^[0-9a-f]{24}$/);
    expect(ghostId()).not.toBe(ghostId());
  });
});
