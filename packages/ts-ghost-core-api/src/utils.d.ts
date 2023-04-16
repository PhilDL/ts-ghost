export declare type Mask<Obj> = {
  [k in keyof Obj]?: true;
};

export declare type InferResponseDataShape<T> = T extends { success: true; data: infer D } ? D : never;

export declare type InferFetcherDataShape<T extends { fetch: () => Promise<any> }> = InferResponseDataShape<
  Awaited<ReturnType<T["fetch"]>>
>;

export type IsAny<T> = 0 extends 1 & T ? true : false;
