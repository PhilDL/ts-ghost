import { test, describe, expect } from "vitest";
import { schemaWithPickedFields } from "./fields";
import { z } from "zod";

describe("schemaWithPickedFields()", () => {
  test("should pick fields", () => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      profile_image: z.string(),
      cover_image: z.string(),
      bio: z.string(),
      website: z.string(),
      location: z.string(),
      facebook: z.string(),
      twitter: z.string(),
      url: z.string(),
    });
    const fields = schemaWithPickedFields(schema, {
      id: true,
      name: true,
    });
    expect(fields).toBeDefined();
    expect(fields).not.toBeNull();
    expect(fields).not.toBeUndefined();
    expect(fields).not.toBe(schema);
    expect(fields.shape.id).toBeDefined();
    expect(fields.shape.name).toBeDefined();
    // @ts-expect-error
    expect(fields.shape.slug).toBeUndefined();
  });
});
