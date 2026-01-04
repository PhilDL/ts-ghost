export type DebugOption = {
  debug?: boolean;
  logger?: (message?: any, ...optionalParams: any[]) => void;
};

export const resolveDebugLogger = (options?: DebugOption) => {
  if (options?.debug) {
    return options.logger ? options.logger : console.log;
  }
  return () => {};
};
