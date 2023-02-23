import type { GhostAPI } from "@tryghost/content-api";
import { Tag, Author, AuthorSchema } from "./zod-schemas";
import GhostContentAPI from "@tryghost/content-api";
import fetch from "node-fetch";
import { GhostFetchTiersSchema, GhostMetaSchema, filterSchema } from "./zod-schemas";
import { z, ZodRawShape } from "zod";

type Split<Str, Separator extends string> = Str extends `${infer Start}${Separator}${infer Rest}`
  ? [Start, ...Split<Rest, Separator>]
  : [Str];

export type BrowseOrder<S, Shape> = S extends string
  ? S extends `${infer Field} ${infer Direction}`
    ? Field extends keyof Shape
      ? Direction extends "ASC" | "DESC" | "asc" | "desc"
        ? `${Field} ${Direction}`
        : never
      : never
    : S extends keyof Shape
    ? `${S}`
    : never
  : never;

type test = BrowseOrder<"name DESC", z.infer<typeof AuthorSchema>>;
type ooo = z.infer<typeof AuthorSchema>;

export type BrowseArgs<Shape> = {
  limit?: number;
  page?: number;
  order?: BrowseOrder<keyof Shape, Shape>;
  filter?: string;
  fields?: Array<keyof Shape>;
  include?: Array<keyof Shape>;
};

export type BrowParams<P, Shape> = P extends { order: infer Order; limit?: number; page?: number }
  ? Omit<P, "order"> & { order: BrowseOrder<Order, Shape> }
  : P;

export type test2 = BrowParams<{ order: "name ASC" }, z.infer<typeof AuthorSchema>>;

export class Endpoint<Shape extends ZodRawShape> {
  private _mask: z.noUnrecognized<z.objectKeyMask<Shape>, Shape> | undefined = undefined;
  private _order: string | undefined = undefined;

  constructor(private readonly schema: z.ZodObject<Shape>) {}

  fetch = async () => {
    return this._fetch();
  };

  fields = <Fields extends z.objectKeyMask<Shape>>(mask: z.noUnrecognized<Fields, Shape>) => {
    return new Endpoint(this.schema.pick(mask));
  };

  order = <O extends string>(order: BrowseOrder<O, Shape>) => {
    this._order = order;
    return this;
  };

  browse = async <P extends { order?: string; limit?: number; page?: number }>({ order }: BrowParams<P, Shape>) => {
    console.log("order", order);
    return await this._fetch();
  };

  _fetch = async () => {
    const result = (await (await fetch("https://api.github.com/users/typicode")).json()) as unknown;
    // if (this._mask !== undefined) {
    //   // <Mask extends objectKeyMask<T>>(mask: noUnrecognized<Mask, T>)
    //   const filteredSchema = this.schema.pick(this._mask);
    //   return filteredSchema.parse(result);
    // }
    return this.schema.parse(result);
  };
}
