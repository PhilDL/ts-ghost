import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { bootstrapGhost } from "../ghost/bootstrap.ts";
import { startGhost, type GhostInstance } from "../ghost/instance.ts";
import { OUTPUT_MARKER, type RouteDefinition } from "./ghost-router.ts";
import { buildManifest, MANIFEST_FILE, serialiseManifest, type Manifest } from "./manifest.ts";
import { probeRoutes } from "./probe.ts";

const ROUTE_READER = fileURLToPath(new URL("./ghost-router.ts", import.meta.url));

/**
 * Generates the manifest on a throwaway Ghost. Probing with a session reaches the database wipe and the
 * key reset, so it refuses any Ghost that has already been set up (seeded or shared).
 */
export async function generateManifest(ghost: GhostInstance): Promise<Manifest> {
  await assertFresh(ghost.url);
  const definitions = await readRouteDefinitions(ghost);
  const credentials = await bootstrapGhost(ghost.url);
  return buildManifest(ghost.version, await probeRoutes(ghost.url, definitions, credentials));
}

async function assertFresh(url: string) {
  const response = await fetch(`${url}/ghost/api/admin/authentication/setup/`);
  const body = (await response.json()) as { setup?: { status: boolean }[] };
  if (body.setup?.[0]?.status !== false)
    throw new Error(
      `Ghost at ${url} is already set up; the manifest is only generated on a fresh throwaway Ghost`,
    );
}

async function readRouteDefinitions(ghost: GhostInstance): Promise<RouteDefinition[]> {
  const target = "/tmp/ts-ghost-router.mts";
  await ghost.compose("cp", ROUTE_READER, `ghost:${target}`);
  const { stdout } = await ghost.compose("exec", "-T", "ghost", "node", target);
  const line = stdout.split("\n").find((l) => l.startsWith(OUTPUT_MARKER));
  if (!line) throw new Error(`The route reader printed no routes:\n${stdout}`);
  return JSON.parse(line.slice(OUTPUT_MARKER.length)) as RouteDefinition[];
}

/** CLI: starts a fresh pinned Ghost, generates the manifest, writes it to the repo, removes the Ghost. */
async function main() {
  const ghost = await startGhost({ name: "ts-ghost-manifest" });
  try {
    const manifest = await generateManifest(ghost);
    await writeFile(MANIFEST_FILE, serialiseManifest(manifest));
    console.log(`Wrote ${manifest.routes.length} routes for Ghost ${manifest.ghost} to ${MANIFEST_FILE}`);
  } finally {
    await ghost.stop();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
