import { describe, expect, test } from "vitest";
import { z } from "zod/v3";

import { schemaWithPickedFields } from "./fields";

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

  test("should pick fields with empty dict", () => {
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
    const fields = schemaWithPickedFields(schema);
    expect(fields).toBeDefined();
    expect(fields).not.toBeNull();
    expect(fields).toBeDefined();
    expect(fields).not.toBe(schema);
    expect(fields.shape.id).toBeUndefined();
    expect(fields.shape.name).toBeUndefined();
    expect(fields.shape.slug).toBeUndefined();
  });
});
