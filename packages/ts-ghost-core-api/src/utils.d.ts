export declare type Mask<Obj> = {
  [k in keyof Obj]?: true;
};

export declare type InferGhostResponseData<T> = T extends { status: "success"; data: infer D } ? D : never;
