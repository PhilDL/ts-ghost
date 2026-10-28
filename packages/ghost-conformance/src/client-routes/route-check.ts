import type { ManifestRoute } from "../manifest/manifest.ts";

/** One request the client makes; `path` has every param segment erased to `:`. */
export type ClientCall = { name: string; method: string; path: string };

const erase = (path: string) => path.replace(/:[^/]+/g, ":");

/** Why Ghost would not serve this call to the client's integration token, or undefined if it would. */
export function checkCall(routes: ManifestRoute[], call: ClientCall): string | undefined {
  const route = routes.find((r) => r.method === call.method && erase(r.path) === call.path);
  const request = `${call.name} calls ${call.method} ${call.path}`;
  if (!route) return `${request}, which Ghost does not have`;
  if (!route.integration) return `${request}, which refuses integration tokens`;
  return undefined;
}
