import { beforeEach } from "vitest";

declare module "vitest" {
  interface TaskMeta {
    expectedFailure?: boolean;
  }
}

// Setup file: marks `test.fails` tests in the JSON report, which lists them as passed, so drift counts them apart.
beforeEach(({ task }) => {
  if (task.fails) task.meta.expectedFailure = true;
});
