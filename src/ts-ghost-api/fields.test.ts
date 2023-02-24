import { describe, test, expect } from "vitest";
import { schemaWithPickedFields } from "./fields";
import { z } from "zod";
describe("fields", () => {
  const schema = z.object({
    name: z.string(),
    website: z.string(),
    email: z.string(),
    count: z.object({
      posts: z.number(),
    }),
  });
  const testData = {
    name: "John Doe",
    website: "https://example.com",
    email: "john.doe@test.com",
    count: {
      posts: 0,
    },
  };
  test("parseFields() should return a new schema with only the fields specified in the fields object", () => {
    const newSchema = schemaWithPickedFields(schema, {
      name: true,
      website: true,
    });

    expect(newSchema.parse(testData)).toEqual(
      z
        .object({
          name: z.string(),
          website: z.string(),
        })
        .parse(testData)
    );
  });

  test("parseFields() should return a new schema stripped of unknown fields also with ts-error", () => {
    const newSchema = schemaWithPickedFields(schema, {
      name: true,
      // @ts-expect-error - shouldnt accept invalid params
      foo: true,
    });

    expect(newSchema.parse(testData)).toEqual(
      z
        .object({
          name: z.string(),
        })
        .parse(testData)
    );
  });
});
