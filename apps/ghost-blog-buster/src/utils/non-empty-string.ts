export const nonEmptyString = (value: unknown | undefined): value is string => {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return false;
  }
  return true;
};
