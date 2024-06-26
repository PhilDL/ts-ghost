import { z } from "zod";

import type { Exactly, Mask } from "../utils";

/**
 * Parse a Fields object and generate a new Output Schema
 *
 * @param schema Base Resource Schema
 * @param fields Object containing fields to be picked with true as value
 * @returns new schema with only the fields specified in the fields object
 */
export const schemaWithPickedFields = <Shape extends z.ZodRawShape, Fields extends Mask<Shape>>(
  schema: z.ZodObject<Shape>,
  fields?: Fields,
) => {
  return schema.pick((fields as Exactly<Fields, Fields>) || ({} as z.noUnrecognized<Fields, Shape>));
};
