import type { BrowseParamsSchema, ContentAPICredentials } from "@ts-ghost/core-api";
import { ZodRawShape } from "zod";
import { BaseQueryBuilder } from "@ts-ghost/core-api";

export class PagesAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema,
  Api extends ContentAPICredentials
> extends BaseQueryBuilder<Shape, OutputShape, IncludeShape, B, Api> {}
