import { SignJWT } from "jose";

export type HTTPClientOptions = {
  key: string;
  version: string;
  endpoint: "content" | "admin";
};

export class HTTPClient<Api extends HTTPClientOptions = any> {
  private _jwt: string | undefined;
  private _jwtExpiresAt: number | undefined;

  constructor(protected _apiCredentials: Api) {}

  get jwt() {
    return this._jwt;
  }

  public async generateJWT(key: string) {
    const [id, _secret] = key.split(":");
    this._jwtExpiresAt = Date.now() + 5 * 60 * 1000;
    return new SignJWT({})
      .setProtectedHeader({ kid: id, alg: "HS256" })
      .setExpirationTime("5m")
      .setIssuedAt()
      .setAudience("/admin/")
      .sign(
        Uint8Array.from((_secret.match(/.{1,2}/g) as RegExpMatchArray).map((byte) => parseInt(byte, 16)))
      );
  }

  public async genHeaders(api: HTTPClientOptions) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Version": api.version,
    };
    if (api.endpoint === "admin") {
      if (this._jwt === undefined || this._jwtExpiresAt === undefined || this._jwtExpiresAt < Date.now()) {
        console.log("generating jwt");
        this._jwt = await this.generateJWT(api.key);
      }
      headers["Authorization"] = `Ghost ${this.jwt}`;
    }
    return headers;
  }

  public async fetch(URL: URL | undefined, api: HTTPClientOptions, options?: RequestInit) {
    if (URL === undefined) throw new Error("URL is undefined");
    let result = undefined;
    const headers = await this.genHeaders(api);
    try {
      result = await (
        await fetch(URL.toString(), {
          ...options,
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

  public async fetchRawResponse(URL: URL | undefined, api: HTTPClientOptions, options?: RequestInit) {
    if (URL === undefined) throw new Error("URL is undefined");
    const headers = await this.genHeaders(api);
    return await fetch(URL.toString(), {
      ...options,
      headers,
    });
  }
}
