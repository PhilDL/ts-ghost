import fetch from "cross-fetch";
import jwt from "jsonwebtoken";
import type { APICredentials } from "../schemas/shared";

export function getJWT(key: string) {
  const [id, secret] = key.split(":");

  return jwt.sign({}, Buffer.from(secret, "hex"), {
    keyid: id,
    algorithm: "HS256",
    expiresIn: "5m",
    audience: "/admin/",
  });
}

export async function _fetch(URL: URL | undefined, api: APICredentials) {
  if (URL === undefined) throw new Error("URL is undefined");
  let result = undefined;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Version": api.version,
  };
  if (api.endpoint === "admin") {
    headers["Authorization"] = `Ghost ${getJWT(api.key)}`;
  }
  try {
    result = await (
      await fetch(URL.toString(), {
        headers,
      })
    ).json();
  } catch (e) {
    return {
      status: "error",
      errors: [
        {
          type: "FetchError",
          message: (e as Error).toString(),
        },
      ],
    };
  }
  console.log("result", result);
  return result;
}
