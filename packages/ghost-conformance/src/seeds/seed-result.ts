/** Unwraps a client result while seeding; a failed seed aborts the test file. */
export function must<T>(
  result: { success: true; data: T } | { success: false; errors: unknown },
  what: string,
): T {
  if (!result.success) throw new Error(`Seeding ${what} failed: ${JSON.stringify(result.errors)}`);
  return result.data;
}
