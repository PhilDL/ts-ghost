import { randomBytes } from "node:crypto";

/** Short random tag that keeps seeded slugs, names and emails unique per test file and run. */
export const uniqueSuffix = () => randomBytes(4).toString("hex");
