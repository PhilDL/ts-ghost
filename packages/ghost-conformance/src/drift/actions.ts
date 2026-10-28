/** Lines for $GITHUB_OUTPUT; a line break in a value would smuggle in another output. */
export function stepOutputs(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => {
      if (/[\r\n]/.test(key + value)) throw new Error(`Step output ${key} contains a line break`);
      return `${key}=${value}\n`;
    })
    .join("");
}

/** A one-line `::error::` for the run's annotations; the full message belongs in the log. */
export function errorAnnotation(message: string): string {
  const [first = "", ...rest] = message.split(/\r?\n/);
  const escaped = first.replace(/%/g, "%25").replace(/\r/g, "%0D");
  return `::error::${escaped}${rest.length ? " (details in the log)" : ""}`;
}
