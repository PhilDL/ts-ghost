import { z } from "zod";

/**
 * Parse a Fields object and generate a new Output Schema
 *
 * @param schema Base Resource Schema
 * @param fields Object containing fields to be picked with true as value
 * @returns new schema with only the fields specified in the fields object
 */
export const schemaWithPickedFields = <Shape extends z.ZodRawShape, Fields extends z.objectKeyMask<Shape>>(
  schema: z.ZodObject<Shape>,
  fields?: z.noUnrecognized<Fields, Shape>
) => {
  return schema.pick(fields || ({} as z.noUnrecognized<Fields, Shape>));
};
