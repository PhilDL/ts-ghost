import type { ProvidedContext } from "vitest";

/** Calls the Admin API with the Owner's session, for writes the client has no method for. */
export async function sessionRequest<T>(
  ghost: Pick<ProvidedContext["ghost"], "url" | "sessionCookie">,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${ghost.url}/ghost/api/admin${path}`, {
    method,
    headers: { cookie: ghost.sessionCookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path} ${response.status} ${await response.text()}`);
  const text = await response.text();
  // DELETE answers 204 with no body.
  return (text ? JSON.parse(text) : undefined) as T;
}
