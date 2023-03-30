import fetch from "cross-fetch";
import type { APICredentials } from "../schemas/shared";
import { SignJWT } from "jose";

export async function getJWT(key: string) {
  const [id, _secret] = key.split(":");

  return new SignJWT({})
    .setProtectedHeader({ kid: id, alg: "HS256" })
    .setExpirationTime("5m")
    .setIssuedAt()
    .setAudience("/admin/")
    .sign(Uint8Array.from((_secret.match(/.{1,2}/g) as RegExpMatchArray).map((byte) => parseInt(byte, 16))));
}

export async function _genHeaders(api: APICredentials) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Version": api.version,
  };
  if (api.endpoint === "admin") {
    const jwt = await getJWT(api.key);
    headers["Authorization"] = `Ghost ${jwt}`;
  }
  return headers;
}

export async function _fetch(URL: URL | undefined, api: APICredentials) {
  if (URL === undefined) throw new Error("URL is undefined");
  let result = undefined;
  const headers = await _genHeaders(api);
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
  return result;
}
