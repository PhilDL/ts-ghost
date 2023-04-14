import type { APICredentials } from "../schemas";
import { z, ZodRawShape, ZodTypeAny } from "zod";
import { MutationFetcher } from "../fetchers/mutation-fetcher";
import { QueryBuilder } from "./query-builder";

/**
 * QueryBuilderWithMutations class extends the QueryBuilder and add public methods to create and edit ressources.
 */
export class QueryWithMutationsBuilder<
  Shape extends ZodRawShape = any,
  IdentityShape extends z.ZodTypeAny = any,
  IncludeShape extends ZodRawShape = any,
  CreateShape extends ZodRawShape = any,
  CreateOptions extends ZodTypeAny = any,
  Api extends APICredentials = any
> extends QueryBuilder<Shape, IdentityShape, IncludeShape, Api> {
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      identitySchema: IdentityShape;
      include: z.ZodObject<IncludeShape>;
      createSchema: z.ZodObject<CreateShape>;
      createOptionsSchema?: CreateOptions;
    },
    protected _api: Api
  ) {
    super(
      {
        schema: config.schema,
        identitySchema: config.identitySchema,
        include: config.include,
      },
      _api
    );
  }

  public async add(data: z.output<z.ZodObject<CreateShape>>, options?: CreateOptions["_output"]) {
    const parsedData = this.config.createSchema.parse(data);
    const parsedOptions =
      this.config.createOptionsSchema && options
        ? this.config.createOptionsSchema.parse(options)
        : undefined;
    const fetcher = new MutationFetcher(
      {
        output: this.config.schema,
        paramsShape: this.config.createOptionsSchema,
      },
      parsedOptions,
      this._api
    );
    return fetcher.post(parsedData);
  }

  public async edit(id: string, data: Partial<z.output<z.ZodObject<CreateShape>>>) {
    const editSchema = this.config.createSchema.partial();
    const parsedData = editSchema.parse(data);
    const fetcher = new MutationFetcher(
      {
        output: this.config.schema,
        paramsShape: this.config.createOptionsSchema,
      },
      undefined,
      this._api
    );
    return fetcher.put(id, parsedData);
  }
}
