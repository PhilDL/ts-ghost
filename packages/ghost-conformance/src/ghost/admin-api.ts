/** Path of Ghost's Admin API under the site URL. */
export const ADMIN_API_PATH = "/ghost/api/admin";

export const adminApiUrl = (url: string) => `${url}${ADMIN_API_PATH}`;
