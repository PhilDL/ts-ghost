export type RecordedResponse = {
  method: string;
  url: string;
  status: number;
  body: unknown;
  /** What a tracked client returned from this body, set by `trackParsed`. */
  parsed?: unknown;
};

let active: RecordedResponse[] | undefined;

export type ResponseRecorder = {
  all(): RecordedResponse[];
  /** Raw JSON body of the latest response whose URL path contains `pathPart`. */
  last(pathPart: string): unknown;
  restore(): void;
};

/** Wraps global fetch on the test side to keep each raw JSON body; the client gets no hooks. */
export function recordResponses(): ResponseRecorder {
  const original = globalThis.fetch;
  const recorded: RecordedResponse[] = [];
  active = recorded;
  globalThis.fetch = async (input, init) => {
    const response = await original(input, init);
    const url = input instanceof Request ? input.url : input.toString();
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    const body = await response
      .clone()
      .json()
      .catch(() => undefined);
    recorded.push({ method, url, status: response.status, body });
    return response;
  };
  return {
    all: () => [...recorded],
    last(pathPart) {
      const hit = recorded.findLast((r) => new URL(r.url).pathname.includes(pathPart));
      if (!hit) throw new Error(`No response recorded for a path containing "${pathPart}"`);
      return hit.body;
    },
    restore() {
      globalThis.fetch = original;
      if (active === recorded) active = undefined;
    },
  };
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Keys present in Ghost's raw response but stripped by the client's Zod parse, i.e. keys its schema lacks.
 * Paths start at `at`; array indices collapse to `[]`. Paths listed in `ignore` are left out.
 */
export function unknownKeys(
  raw: unknown,
  parsed: unknown,
  opts: { at: string; ignore?: string[] },
): string[] {
  const found = new Set<string>();
  const walk = (r: unknown, p: unknown, path: string) => {
    if (Array.isArray(r) && Array.isArray(p)) {
      r.forEach((item, i) => walk(item, p[i], `${path}[]`));
    } else if (isObject(r) && isObject(p)) {
      for (const key of Object.keys(r)) {
        if (key in p) walk(r[key], p[key], `${path}.${key}`);
        else found.add(`${path}.${key}`);
      }
    }
  };
  walk(raw, parsed, opts.at);
  const ignored = new Set(opts.ignore ?? []);
  return [...found].filter((path) => !ignored.has(path)).sort();
}

/** Wraps a client so each successful result is stored as `parsed` on the response it came from. */
export function trackParsed<T extends object>(client: T): T {
  return wrap(client) as T;
}

function wrap(value: unknown): unknown {
  if (typeof value !== "object" || value === null || value instanceof Promise) return value;
  return new Proxy(value, {
    get(target, prop) {
      const member: unknown = Reflect.get(target, prop, target);
      if (typeof member !== "function") return wrap(member);
      return (...args: unknown[]) => {
        const [log, from] = [active, active?.length ?? 0];
        const out: unknown = member.apply(target, args);
        if (!(out instanceof Promise)) return wrap(out);
        return out.then((result: unknown) => {
          const response = log?.slice(from).findLast((r) => isObject(r.body));
          if (response && isObject(result) && result.success === true && "data" in result)
            response.parsed = result.data;
          return result;
        });
      };
    },
  });
}

/** Unknown keys of every recorded response a tracked client parsed, as `<resource>[].<path>`. */
export function unknownKeysOfResponses(responses: RecordedResponse[], ignore: string[]): string[] {
  const found = new Set<string>();
  for (const { url, body, parsed } of responses) {
    if (parsed === undefined || !isObject(body)) continue;
    // `.fields()` narrows the result on purpose, and Ghost ignores `fields` on some resources.
    if (new URL(url).searchParams.has("fields")) continue;
    const key = Object.keys(body).find((k) => k !== "meta");
    if (!key) continue;
    const raw = body[key];
    const counterpart = Array.isArray(raw) && !Array.isArray(parsed) ? [parsed] : parsed;
    for (const path of unknownKeys(raw, counterpart, { at: key, ignore })) found.add(path);
  }
  return [...found].sort();
}
