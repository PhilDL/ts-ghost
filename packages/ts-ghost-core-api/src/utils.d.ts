export declare type Mask<Obj> = {
  [k in keyof Obj]?: true;
};

export declare type InferGhostResponseData<T> = T extends { status: "success"; data: infer D } ? D : never;

export declare type InferFetcherData<T extends { fetch: () => Promise<any> }> = InferGhostResponseData<
  Awaited<ReturnType<T["fetch"]>>
>;
