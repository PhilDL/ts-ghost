import { z } from "zod";

type Split<Str, Separator extends string> = Str extends `${infer Start}${Separator}${infer Rest}`
  ? [Start, ...Split<Rest, Separator>]
  : [Str];

export type BrowseOrder<S, Shape> = S extends [infer Head, ...infer Tail]
  ? Tail extends []
    ? OrderPredicate<Head, Shape>
    : `${OrderPredicate<Head, Shape>},${BrowseOrder<Tail, Shape>}`
  : S extends string
  ? OrderPredicate<S, Shape>
  : never;
// This ASC DESC asc desc is probably NOT the best way to do this
// as union is distributive and will create a lot of types
// TODO: find a better way to do this

export type OrderPredicate<S, Shape> = S extends string
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
export type FilterQuerySeparator = "+" | "," | "(" | ")";
export type FilterQueryOperators = `-` | `>` | `<` | `~`;
export type FilterQuerySetOperators = `-`;
export type FieldOrSubField<S> = S extends `${infer Field}.${string}` ? Field : S;

export type BrowseFilter<S, Shape> = S extends string
  ? S extends `${infer Field}:${infer Rest}`
    ? FieldOrSubField<Field> extends keyof Shape
      ? Rest extends `${FilterQuerySetOperators}[${infer Values}]`
        ? `${Field}:${FilterQuerySetOperators}[${Values}]`
        : Rest extends `[${infer Values}]`
        ? `${Field}:[${Values}]`
        : Rest extends `${FilterQuerySetOperators}[${infer Values}]${FilterQuerySeparator}${infer NextQuery}`
        ? `${Field}:${FilterQuerySetOperators}[${Values}]${FilterQuerySeparator}${BrowseFilter<
            NextQuery,
            Shape
          >}`
        : Rest extends `[${infer Values}]${FilterQuerySeparator}${infer NextQuery}`
        ? `${Field}:[${Values}]${FilterQuerySeparator}${BrowseFilter<NextQuery, Shape>}`
        : Rest extends `${infer Value}${FilterQuerySeparator}${infer NextQuery}`
        ? `${Field}:${Value}${FilterQuerySeparator}${BrowseFilter<NextQuery, Shape>}`
        : Rest extends `${infer Value}`
        ? Value extends string
          ? `${Field}:${Value}`
          : never
        : never
      : never
    : never
  : never;

export type BrowseParams<P, Shape> = P extends { order: infer Order }
  ? P extends { filter: infer Filter }
    ? Omit<P, "order" | "filter"> & { order: BrowseOrder<Split<Order, ",">, Shape> } & {
        filter: BrowseFilter<Filter, Shape>;
      }
    : Omit<P, "order"> & { order: BrowseOrder<Split<Order, ",">, Shape> }
  : P extends { filter: infer Filter }
  ? Omit<P, "filter"> & { filter: BrowseFilter<Filter, Shape> }
  : P;

export const browseParamsSchema = z.object({
  order: z.string().optional(),
  limit: z
    .union([
      z.literal("all"),
      z.number().refine((n) => n && n > 0 && n <= 15, {
        message: "Limit must be between 1 and 15",
      }),
    ])
    .optional(),
  page: z
    .number()
    .refine((n) => n && n >= 1, {
      message: "Page must be greater than 1",
    })
    .optional(),
  filter: z.string().optional(),
});
export type BrowseParamsSchema = z.infer<typeof browseParamsSchema>;

export const parseBrowseParams = <P, Shape extends z.ZodRawShape, IncludeShape extends z.ZodRawShape>(
  args: P,
  schema: z.ZodObject<Shape>,
  includeSchema?: z.ZodObject<IncludeShape>
) => {
  const keys = [
    ...(schema.keyof().options as string[]),
    ...((includeSchema && (includeSchema.keyof().options as string[])) || []),
  ];
  const augmentedSchema = browseParamsSchema.merge(
    z.object({
      order: z
        .string()
        .superRefine((val, ctx) => {
          const orderPredicates = val.split(",");
          for (const orderPredicate of orderPredicates) {
            const [field, direction] = orderPredicate.split(" ");
            if (!keys.includes(field)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Field "${field}" is not a valid field`,
                fatal: true,
              });
            }
            if (direction && !(direction.toUpperCase() === "ASC" || direction.toUpperCase() === "DESC")) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Order direction must be ASC or DESC",
                fatal: true,
              });
            }
          }
        })
        .optional(),
      filter: z
        .string()
        .superRefine((val, ctx) => {
          const filterPredicates = val.split(/[+(,]+/);
          for (const filterPredicate of filterPredicates) {
            const field = filterPredicate.split(":")[0].split(".")[0];
            if (!keys.includes(field)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Field "${field}" is not a valid field`,
                fatal: true,
              });
            }
          }
        })
        .optional(),
    })
  );
  return augmentedSchema.parse(args);
};
