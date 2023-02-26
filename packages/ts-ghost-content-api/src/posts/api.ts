import type { ContentAPICredentials } from "@ts-ghost/core-api";
import { ZodRawShape } from "zod";
import { QueryBuilder } from "@ts-ghost/core-api";

export class PostsAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends ContentAPICredentials
> extends QueryBuilder<Shape, OutputShape, IncludeShape, Api> {}
