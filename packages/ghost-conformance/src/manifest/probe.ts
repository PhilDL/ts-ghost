import { createHmac } from "node:crypto";

import { adminApiUrl } from "../ghost/admin-api.ts";
import { readStaffToken, signIn, type GhostCredentials } from "../ghost/bootstrap.ts";
import {
  classifyRoute,
  CREDENTIALS,
  type Credential,
  type ProbeResponses,
  type RouteAccess,
} from "./classify.ts";
import type { RouteDefinition } from "./ghost-router.ts";

const PROBE_TIMEOUT_MS = 10_000;

type Hazard = { route: string; repair?: (creds: GhostCredentials, url: string) => Promise<void> };

/** Probes that kill or change a credential run last, in this order, each followed by its repair. */
const HAZARDS: Hazard[] = [
  // Regenerates the Owner's staff token; the session reads the new one.
  {
    route: "PUT /users/:id/token",
    repair: async (creds, url) => void (creds.staffToken = await readStaffToken(url, creds.sessionCookie)),
  },
  // Logs the probing session out.
  {
    route: "DELETE /session",
    repair: async (creds, url) => void (creds.sessionCookie = await signIn(url, creds.owner)),
  },
  // Wipes content; credentials survive.
  { route: "DELETE /db" },
  // Rotates every key and ends every session, so nothing can follow it.
  { route: "POST /authentication/reset" },
];

/** Calls every route without a body, once anonymously and once per credential, and classifies the answers. */
export async function probeRoutes(
  url: string,
  routes: RouteDefinition[],
  credentials: GhostCredentials,
): Promise<(RouteDefinition & { access: RouteAccess })[]> {
  const creds = { ...credentials };
  const hazardOf = (r: RouteDefinition) => HAZARDS.findIndex((h) => h.route === `${r.method} ${r.path}`);
  const missing = HAZARDS.filter((h) => !routes.some((r) => `${r.method} ${r.path}` === h.route));
  if (missing.length)
    throw new Error(`Hazard routes not found in Ghost: ${missing.map((h) => h.route).join(", ")}`);
  const ordered = [
    ...routes.filter((r) => hazardOf(r) < 0),
    ...routes.filter((r) => hazardOf(r) >= 0).sort((a, b) => hazardOf(a) - hazardOf(b)),
  ];

  const results: (RouteDefinition & { access: RouteAccess })[] = [];
  for (const [i, route] of ordered.entries()) {
    // No auth middleware: not probed, which also spares the sign-in and password-reset rate limiters.
    if (route.guard === "none") {
      results.push({ ...route, access: classifyRoute(route, {} as ProbeResponses) });
      continue;
    }
    const responses = { none: await probe(url, route, null) } as ProbeResponses;
    for (const credential of CREDENTIALS)
      responses[credential] = await probe(url, route, header(credential, creds));
    results.push({ ...route, access: classifyRoute(route, responses) });

    const hazard = HAZARDS[hazardOf(route)];
    await hazard?.repair?.(creds, url);
    if (i < ordered.length - 1) await assertCredentialsWork(url, creds, `${route.method} ${route.path}`);
  }
  return results;
}

async function probe(url: string, route: RouteDefinition, auth: Record<string, string> | null) {
  try {
    const response = await fetch(`${adminApiUrl(url)}${probePath(route.path)}`, {
      method: route.method,
      headers: auth ?? {},
      // Ghost's media upload validation crashes the whole process on a non-multipart request.
      body: route.path.endsWith("/upload") && route.method !== "GET" ? new FormData() : undefined,
      redirect: "manual",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    await response.body?.cancel();
    return { status: response.status };
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError")
      return { status: "timeout" as const };
    throw new Error(`${route.method} ${route.path}: probe failed`, { cause: error });
  }
}

/** Fills route params with values that match nothing, so writes and deletes touch no data. */
function probePath(path: string): string {
  // Ghost lets only the user themself read or regenerate their staff token, so a foreign id would 403.
  if (path === "/users/:id/token") return "/users/me/token/";
  const filled = path.replace(/:(\w+)/g, (_, name: string) =>
    /id$/i.test(name) ? "ffffffffffffffffffffffff" : "ts-ghost-probe",
  );
  if (/[*?()]/.test(filled)) throw new Error(`Can't fill route pattern ${path}`);
  return filled.endsWith("/") ? filled : `${filled}/`;
}

function header(credential: Credential, creds: GhostCredentials): Record<string, string> {
  if (credential === "session") return { cookie: creds.sessionCookie };
  return {
    authorization: `Ghost ${adminJwt(credential === "staff" ? creds.staffToken : creds.integrationKey)}`,
  };
}

/** HS256 JWT as Ghost expects for both integration keys and staff tokens; valid for five minutes. */
function adminJwt(key: string): string {
  const [id, secret] = key.split(":");
  if (!id || !secret) throw new Error("Admin key must be <id>:<secret>");
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${part({ alg: "HS256", typ: "JWT", kid: id })}.${part({ iat: now, exp: now + 300, aud: "/admin/" })}`;
  const signature = createHmac("sha256", Buffer.from(secret, "hex")).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

/** A credential that silently died would turn every later probe into a refusal. */
async function assertCredentialsWork(url: string, creds: GhostCredentials, after: string) {
  for (const credential of CREDENTIALS) {
    const response = await fetch(`${adminApiUrl(url)}/posts/?limit=1`, {
      headers: header(credential, creds),
    });
    await response.body?.cancel();
    if (response.status !== 200)
      throw new Error(
        `The ${credential} credential stopped working (${response.status}) after probing ${after}`,
      );
  }
}
