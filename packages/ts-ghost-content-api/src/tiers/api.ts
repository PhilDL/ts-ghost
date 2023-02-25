import type { BrowseParamsSchema, BrowseParams } from "@ts-ghost/core-api";
import { z, ZodRawShape } from "zod";
import { BaseAPI, schemaWithPickedFields, parseBrowseParams, GhostMetaSchema } from "@ts-ghost/core-api";

export class TiersAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, IncludeShape, B> {
  /**
   * Browse function
   * @param {}
   * @returns
   */
  browse = <
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
    },
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options?: {
    input?: BrowseParams<P, Shape>;
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
    };
  }) => {
    const tiersApi = new TiersAPI(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields &&
            schemaWithPickedFields(
              this.config.output,
              options.output.fields || ({} as z.noUnrecognized<Fields, OutputShape>)
            )) ||
          schemaWithPickedFields(this.config.output, {} as z.noUnrecognized<Fields, OutputShape>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      tiersApi.setIncludeFields(options.output.include);
    }
    return tiersApi;
  };

  fetch = async () => {
    const result = await this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      tiers: z.array(this.config.output),
    });
    return browseSchema.parse(result);
  };
}
