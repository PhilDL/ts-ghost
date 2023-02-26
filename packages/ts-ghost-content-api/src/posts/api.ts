import type { BrowseParamsSchema, ContentAPICredentials } from "@ts-ghost/core-api";
import { ZodRawShape } from "zod";
import { BaseQueryBuilder } from "@ts-ghost/core-api";

export class PostsAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends ContentAPICredentials
> extends BaseQueryBuilder<Shape, OutputShape, IncludeShape, Api> {}
