import { z } from "zod";

import { contentFormats } from "../fetchers/formats";

type RuntimeMask = Record<string, unknown>;

const getKnownSchemaKeys = <Shape extends z.ZodRawShape>(schema: z.ZodObject<Shape>) => {
  return new Set(schema.keyof().options as string[]);
};

export const sanitizeMask = <Shape extends z.ZodRawShape>(
  schema: z.ZodObject<Shape>,
  mask: RuntimeMask,
  options: { excludeDotNotation?: boolean } = {},
) => {
  const knownKeys = getKnownSchemaKeys(schema);

  return Object.fromEntries(
    Object.entries(mask).filter(
      ([key]) => knownKeys.has(key) && (!options.excludeDotNotation || !key.includes(".")),
    ),
  );
};

export const sanitizeFormatMask = <Shape extends z.ZodRawShape>(schema: z.ZodObject<Shape>, mask: RuntimeMask) => {
  const knownKeys = getKnownSchemaKeys(schema);

  return Object.fromEntries(Object.entries(mask).filter(([key]) => knownKeys.has(key) && contentFormats.includes(key)));
};
