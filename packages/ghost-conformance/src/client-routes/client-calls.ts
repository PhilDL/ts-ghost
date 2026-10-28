import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { ADMIN_API_PATH } from "../ghost/admin-api.ts";
import type { ClientCall } from "./route-check.ts";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const BASE = "http://ghost.test";
/** Stands in for every id, slug and email, so its path segments can be erased to `:`. */
const PARAM = "tsghostparam";
const IDENTITY_VALUES = { id: PARAM, slug: PARAM, email: `${PARAM}@example.com` };
/** Default string input; also a valid slug, which some create schemas check. */
const STRING = "tsghost";
/** Inputs Zod's errors can't lead to: a discriminated union names no valid discriminator. */
const INPUT_HINTS: Record<string, object> = { "offers.add": { type: "fixed" } };

type Issue = { code: string; path: PropertyKey[]; [detail: string]: unknown };
type Method = (...args: unknown[]) => unknown;
type Send = (name: string, call: () => unknown) => Promise<void>;

/** A value that satisfies one Zod issue, so the client's input validation lets the call through. */
function valueFor(issue: Issue): unknown {
  if (issue.code === "invalid_value") return (issue.values as unknown[])[0];
  if (issue.code === "invalid_format") {
    if (issue.format === "email") return "a@example.com";
    if (issue.format === "url") return "https://example.com";
    return "2026-01-01T00:00:00.000Z";
  }
  const type = String(issue.expected ?? issue.origin);
  if (issue.code === "too_small") {
    if (type === "array") return [{}];
    if (type === "number") return issue.minimum;
    return "x".repeat(Number(issue.minimum)) + STRING;
  }
  return { number: 1, boolean: true, object: {}, array: [], date: new Date() }[type] ?? STRING;
}

function setAt(target: Record<PropertyKey, unknown>, path: PropertyKey[], value: unknown) {
  const [head, ...rest] = path;
  if (head === undefined) return;
  if (rest.length === 0) target[head] = value;
  else setAt((target[head] ??= {}) as Record<PropertyKey, unknown>, rest, value);
}

function issuesOf(error: unknown): Issue[] | undefined {
  const issues = (error as { issues?: Issue[] }).issues;
  if (!Array.isArray(issues)) return undefined;
  // a union reports each option's issues; satisfying the first option is enough
  return issues.flatMap((i) =>
    i.code === "invalid_union" && Array.isArray(i.errors) && i.errors[0]
      ? (i.errors[0] as Issue[]).map((inner) => ({ ...inner, path: [...i.path, ...inner.path] }))
      : [i],
  );
}

/** Sends `call(input)`, filling in whatever the client's validation asks for until a request goes out. */
async function sendValid(send: Send, name: string, call: (input: object) => unknown, start = {}) {
  const input = structuredClone({ ...start, ...INPUT_HINTS[name] }) as Record<PropertyKey, unknown>;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await send(name, () => call(input));
      return input;
    } catch (error) {
      const issues = issuesOf(error);
      if (!issues) throw error;
      for (const issue of issues) setAt(input, issue.path, valueFor(issue));
    }
  }
  throw new Error(`${name}: could not build an input the client accepts`);
}

/** A fetch that records each request and answers `{}`, plus `send` to name the requests a call makes. */
function recorder() {
  const calls: ClientCall[] = [];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const path = new URL(String(input)).pathname
      .slice(ADMIN_API_PATH.length)
      .split("/")
      .map((segment) => (decodeURIComponent(segment).includes(PARAM) ? ":" : segment))
      .join("/");
    calls.push({ name: "", method: init?.method ?? "GET", path });
    return new Response("{}", { headers: { "content-type": "application/json" } });
  };
  const send: Send = async (name, call) => {
    const before = calls.length;
    try {
      await call();
    } catch (error) {
      // once the request is out, failing to parse the stub's `{}` doesn't matter
      if (calls.length === before) throw error;
    }
    if (calls.length === before) throw new Error(`${name} sent no request`);
    calls.slice(before).forEach((c) => (c.name = name));
  };
  return { calls, fetch, send };
}

/** Every request the public admin client makes, found by calling each method against a recording fetch. */
export async function recordClientCalls(): Promise<ClientCall[]> {
  const api = new TSGhostAdminAPI(BASE, KEY, "v6.0");
  const { calls, fetch, send } = recorder();
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetch;
  try {
    const resources = Object.entries(Object.getOwnPropertyDescriptors(TSGhostAdminAPI.prototype))
      .filter(([, descriptor]) => descriptor.get)
      .map(([resource]) => resource);
    for (const resource of resources) {
      const methods = api[resource as keyof TSGhostAdminAPI] as unknown as Record<string, Method>;
      if (typeof methods.fetch === "function") {
        await send(`${resource}.fetch`, () => methods.fetch!());
        continue;
      }
      let added = {};
      for (const [op, method] of Object.entries(methods)) {
        const name = `${resource}.${op}`;
        if (op === "browse") await send(name, () => (method() as { fetch: Method }).fetch());
        else if (op === "add") added = await sendValid(send, name, (input) => method(input));
        else if (op === "edit") await sendValid(send, name, (input) => method(PARAM, input), added);
        else if (op === "delete") await send(name, () => method(PARAM));
        else if (op === "read") {
          for (const [form, value] of Object.entries(IDENTITY_VALUES)) {
            let fetcher: { fetch: Method };
            try {
              fetcher = method({ [form]: value }) as { fetch: Method };
            } catch {
              continue; // the client does not read this resource by that form
            }
            await send(`${resource}.read({${form}})`, () => fetcher.fetch());
          }
        } else throw new Error(`${name}: the check does not know how to call this kind of method`);
      }
    }
  } finally {
    globalThis.fetch = realFetch;
  }
  return calls;
}
