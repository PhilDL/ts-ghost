import type { TestProject } from "vitest/node";

import { bootstrapGhost, type GhostCredentials } from "../ghost/bootstrap.ts";
import { startGhost } from "../ghost/instance.ts";
import { sessionRequest } from "../seeds/session.ts";
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
    const credentials = await bootstrapGhost(instance.url);
    await applySqlSeeds({ ...credentials, url: instance.url, project: instance.project });
    // Commenting on for the whole run, so responses match a site with comments enabled.
    await sessionRequest({ ...credentials, url: instance.url }, "PUT", "/settings/", {
      settings: [{ key: "comments_enabled", value: "all" }],
    });
    project.provide("ghost", {
      ...credentials,
      url: instance.url,
      version: instance.version,
      composeProject: instance.project,
    });
  } catch (error) {
    await instance.stop();
    throw error;
  }
  return () => instance.stop();
}
