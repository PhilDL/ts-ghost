import type { TestProject } from "vitest/node";

import { bootstrapGhost, type GhostCredentials } from "../ghost/bootstrap.ts";
import { startGhost } from "../ghost/instance.ts";
import { applySqlSeeds } from "../seeds/sql-seeds.ts";

declare module "vitest" {
  export interface ProvidedContext {
    ghost: GhostCredentials & { url: string; version: string; composeProject: string };
  }
}

/** One fresh, bootstrapped Ghost per live run; torn down afterwards. */
export default async function setup(project: TestProject) {
  const instance = await startGhost({ name: "ts-ghost-live" });
  try {
    const ghost = {
      ...(await bootstrapGhost(instance.url)),
      url: instance.url,
      version: instance.version,
      composeProject: instance.project,
    };
    await applySqlSeeds(ghost);
    project.provide("ghost", ghost);
  } catch (error) {
    await instance.stop();
    throw error;
  }
  return () => instance.stop();
}
