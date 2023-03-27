export declare type Mask<Obj> = {
  [k in keyof Obj]?: true;
};

export declare type InferResponseDataShape<T> = T extends { status: "success"; data: infer D } ? D : never;

export declare type InferFetcherDataShape<T extends { fetch: () => Promise<any> }> = InferResponseDataShape<
  Awaited<ReturnType<T["fetch"]>>
>;
