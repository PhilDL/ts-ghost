import { randomBytes } from "node:crypto";

import { adminApiUrl } from "./admin-api.ts";

export type GhostCredentials = {
  /** Admin API key of a custom integration, "<id>:<secret>". */
  integrationKey: string;
  /** The Owner's personal staff token, "<id>:<secret>". */
  staffToken: string;
  /** `Cookie` header value of a signed-in Owner session. */
  sessionCookie: string;
  owner: { email: string; password: string };
};

/** Title the first-run setup gives the site. */
export const BLOG_TITLE = "ts-ghost conformance";

/** Turns a fresh Ghost into one with an Owner and three credentials, using only public Admin API endpoints. */
export async function bootstrapGhost(url: string): Promise<GhostCredentials> {
  const admin = adminApiUrl(url);
  const owner = { email: "owner@conformance.test", password: `Cf-${randomBytes(12).toString("hex")}` };

  await call("first-run setup", `${admin}/authentication/setup/`, {
    method: "POST",
    body: { setup: [{ name: "Conformance Owner", ...owner, blogTitle: BLOG_TITLE }] },
  });

  const sessionCookie = await signIn(url, owner);

  const integration = (await (
    await call("create integration", `${admin}/integrations/`, {
      method: "POST",
      headers: { cookie: sessionCookie },
      body: { integrations: [{ name: "ts-ghost conformance" }] },
    })
  ).json()) as { integrations: { api_keys: { type: string; secret: string }[] }[] };
  const integrationKey = integration.integrations[0]?.api_keys.find((k) => k.type === "admin")?.secret;
  if (!integrationKey) throw new Error("New integration has no admin API key");

  const staffToken = await readStaffToken(url, sessionCookie);
  return { integrationKey, staffToken, sessionCookie, owner };
}

/** Reads the signed-in user's staff token, "<id>:<secret>". */
export async function readStaffToken(url: string, sessionCookie: string): Promise<string> {
  const response = await call("owner staff token", `${adminApiUrl(url)}/users/me/token/`, {
    headers: { cookie: sessionCookie },
  });
  const { apiKey } = (await response.json()) as { apiKey: { id: string; secret: string } };
  return `${apiKey.id}:${apiKey.secret}`;
}

/** Signs the Owner in and returns the session's `Cookie` header value. */
export async function signIn(url: string, owner: { email: string; password: string }): Promise<string> {
  // Node's fetch sends no Origin, so Ghost falls back to its configured URL; a mismatching Origin is refused.
  const response = await call("sign-in", `${adminApiUrl(url)}/session/`, {
    method: "POST",
    body: { username: owner.email, password: owner.password },
  });
  const sessionCookie = response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .filter((pair) => pair.startsWith("ghost-admin-api-session="))
    .join("; ");
  if (!sessionCookie) throw new Error("Ghost sign-in returned no ghost-admin-api-session cookie");
  return sessionCookie;
}

async function call(
  step: string,
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: unknown },
): Promise<Response> {
  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: { "content-type": "application/json", ...init.headers },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) {
    throw new Error(`Ghost bootstrap step "${step}" failed: ${response.status} ${await response.text()}`);
  }
  return response;
}
