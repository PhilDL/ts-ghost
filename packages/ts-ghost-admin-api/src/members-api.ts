import { QueryBuilder } from "@ts-ghost/core-api";
import { z } from "zod";
import { adminMembersSchema } from "./schemas/members";

const membersIncludeSchema = z.object({});
const queryIdentitySchema = z.object({
  id: z.string(),
});
export class MemberQueryBuilder<
  Shape extends typeof adminMembersSchema.shape,
  Identity extends typeof queryIdentitySchema,
  IncludeShape extends typeof membersIncludeSchema.shape
> extends QueryBuilder<Shape, Identity, IncludeShape> {}
