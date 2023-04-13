import { QueryBuilder, membersCreateSchema, PostFetcher } from "@ts-ghost/core-api";
import { adminMembersSchema } from "./schemas";
import { z } from "zod";

const membersIncludeSchema = z.object({});
const queryIdentitySchema = z.object({
  id: z.string(),
});

const membersCreateQueryParamsSchema = z.object({
  send_email: z.boolean().optional(),
  email_type: z.union([z.literal("signin"), z.literal("subscribe"), z.literal("signup")]).optional(),
});

export class MemberQueryBuilder<
  Shape extends typeof adminMembersSchema.shape,
  Identity extends typeof queryIdentitySchema,
  IncludeShape extends typeof membersIncludeSchema.shape
> extends QueryBuilder<Shape, Identity, IncludeShape> {
  // ...
  public async create(
    data: z.infer<typeof membersCreateSchema>,
    options: z.infer<typeof membersCreateQueryParamsSchema>
  ) {
    const _data = membersCreateSchema.parse(data);
    const _options = membersCreateQueryParamsSchema.parse(options);
    const fetcher = new PostFetcher(
      {
        output: adminMembersSchema,
        paramsShape: membersCreateQueryParamsSchema,
      },
      _options,
      this._api
    );
    return fetcher.post(_data);
  }
}
