// The only module reading Ghost internals: runs in the Ghost image and prints each Admin API route as JSON.
// It builds the router from `admin/routes.js` directly, so it needs no DB or boot and sees labs-off routes.
import { createRequire } from "node:module";

/** Ghost's auth middleware on a route: header/cookie credentials, a `?token=` URL token, or none that checks one. */
export type RouteGuard = "admin" | "url-token" | "none";
export type RouteDefinition = { method: string; path: string; labs: string | null; guard: RouteGuard };

export const OUTPUT_MARKER = "TS_GHOST_ROUTES ";
const GHOST_ROOT = "/var/lib/ghost/current";
const ADMIN_DIR = `${GHOST_ROOT}/core/server/web/api/endpoints/admin`;

type Handle = ((...args: unknown[]) => unknown) & { name: string };
type Layer = {
  name: string;
  handle: Handle & { stack?: Layer[] };
  regexp: RegExp;
  route?: { path: string | string[]; methods: Record<string, boolean>; stack: { handle: Handle }[] };
};

function readRoutes(): RouteDefinition[] {
  process.chdir(GHOST_ROOT);
  const ghostRequire = createRequire(`${ADMIN_DIR}/routes.js`);
  const labs = ghostRequire(`${GHOST_ROOT}/core/shared/labs.js`);
  const mw = ghostRequire(`${ADMIN_DIR}/middleware.js`);
  const router = ghostRequire(`${ADMIN_DIR}/routes.js`)() as { stack: Layer[] };

  const handles = (set: unknown) => new Set<unknown>([set].flat(Infinity as 1));
  const admin = handles(mw.authAdminApi);
  const urlToken = handles(mw.authAdminApiWithUrl);
  // Only handles unique to one set identify it; publicAdminApi (GET /site) has none, so it reads as "none".
  const only = (set: Set<unknown>, other: Set<unknown>) => new Set([...set].filter((h) => !other.has(h)));
  const guards: [RouteGuard, Set<unknown>][] = [
    ["url-token", only(urlToken, admin)],
    ["admin", only(admin, urlToken)],
  ];
  const guardOf = (chain: Handle[]): RouteGuard =>
    guards.find(([, set]) => chain.some((h) => set.has(h)))?.[0] ?? "none";

  // A labs middleware keeps its flag in a closure; calling it with labs.isSet stubbed reveals the flag.
  const isSet = labs.isSet;
  const labsFlag = (chain: Handle[]): string | null => {
    const flags = chain
      .filter((h) => h.name === "labsEnabledMw")
      .map((h) => {
        let flag: string | null = null;
        labs.isSet = (name: string) => ((flag = name), true);
        h({}, {}, () => undefined);
        labs.isSet = isSet;
        if (!flag) throw new Error("labsEnabledMw did not ask labs.isSet for a flag");
        return flag;
      });
    if (flags.length > 1) throw new Error(`Route gated by several labs flags: ${flags.join(", ")}`);
    return flags[0] ?? null;
  };

  const routes: RouteDefinition[] = [];
  // Middleware applies to the routes registered after it: router.use() layers, and router.all() routes
  // (Ghost puts a sub-router's auth on a top-level router.all carrier).
  const walk = (stack: Layer[], prefix: string, inherited: Handle[]) => {
    let before = [...inherited];
    const carriers: { path: string; chain: Handle[] }[] = [];
    for (const layer of stack) {
      if (layer.route) {
        const chain = layer.route.stack.map((s) => s.handle);
        const paths = [layer.route.path].flat();
        if (layer.route.methods._all) {
          for (const path of paths) carriers.push({ path: prefix + path, chain });
          continue;
        }
        for (const path of paths) {
          for (const method of Object.keys(layer.route.methods)) {
            const full = prefix + path;
            const all = [...before, ...carriersFor(carriers, full), ...chain];
            routes.push({
              method: method.toUpperCase(),
              path: full,
              labs: labsFlag(all),
              guard: guardOf(all),
            });
          }
        }
      } else if (layer.handle.stack) {
        const mount = mountPath(layer.regexp);
        walk(layer.handle.stack, prefix + mount, [...before, ...carriersFor(carriers, prefix + mount)]);
      } else {
        before = [...before, layer.handle];
      }
    }
  };
  walk(router.stack, "", []);
  return routes;
}

function carriersFor(carriers: { path: string; chain: Handle[] }[], path: string): Handle[] {
  return carriers
    .filter((c) => c.path === path || (c.path.endsWith("/*") && path.startsWith(c.path.slice(0, -1))))
    .flatMap((c) => c.chain);
}

/** Express 4 keeps a sub-router's mount path only as a regexp, e.g. /^\/apps\/?(?=\/|$)/i. */
function mountPath(regexp: RegExp): string {
  const match = /^\^((?:\\\/[\w-]+)+)\\\/\?\(\?=\\\/\|\$\)$/.exec(regexp.source);
  if (!match?.[1]) throw new Error(`Unexpected sub-router mount ${regexp}`);
  return match[1].replaceAll("\\/", "/");
}

if (process.argv[1]?.includes("ghost-router")) {
  const routes = readRoutes();
  process.stdout.write(`\n${OUTPUT_MARKER}${JSON.stringify(routes)}\n`, () => process.exit(0));
}
