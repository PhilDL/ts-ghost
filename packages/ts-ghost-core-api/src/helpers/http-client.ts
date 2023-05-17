import { SignJWT } from "jose";

import type { APICredentials, APIResource, GhostIdentityInput } from "../schemas";

export type HTTPClientOptions = {
  key: string;
  version: APICredentials["version"];
  url: APICredentials["url"];
  endpoint: "content" | "admin";
};

export class HTTPClient<const Options extends HTTPClientOptions = any> {
  private _jwt: string | undefined;
  private _jwtExpiresAt: number | undefined;
  protected _URL: URL | undefined = undefined;

  constructor(protected config: Options) {
    this._URL = new URL(config.url);
    this._URL.pathname = `/ghost/api/${config.endpoint}/`;
  }

  get URL() {
    return this._URL;
  }

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

  public async genHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Version": this.config.version,
    };
    if (this.config.endpoint === "admin") {
      if (this._jwt === undefined || this._jwtExpiresAt === undefined || this._jwtExpiresAt < Date.now()) {
        this._jwt = await this.generateJWT(this.config.key);
      }
      headers["Authorization"] = `Ghost ${this.jwt}`;
    }
    return headers;
  }

  public async fetch({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit;
    pathnameIdentity?: string;
  }) {
    if (this._URL === undefined) throw new Error("URL is undefined");
    this._URL.pathname += `${resource}/`;
    if (pathnameIdentity !== undefined) {
      this._URL.pathname += `${pathnameIdentity}/`;
    }
    if (searchParams !== undefined) {
      for (const [key, value] of searchParams.entries()) {
        this._URL.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      this._URL.searchParams.append("key", this.config.key);
    }
    let result = undefined;
    const headers = await this.genHeaders();
    try {
      result = await (
        await fetch(this._URL.toString(), {
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

  public async fetchRawResponse({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit;
    pathnameIdentity?: string;
  }) {
    if (this._URL === undefined) throw new Error("URL is undefined");
    this._URL.pathname += `${resource}/`;
    if (pathnameIdentity !== undefined) {
      this._URL.pathname += `${pathnameIdentity}/`;
    }
    if (searchParams !== undefined) {
      for (const [key, value] of searchParams.entries()) {
        this._URL.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      this._URL.searchParams.append("key", this.config.key);
    }
    const headers = await this.genHeaders();
    return await fetch(this._URL.toString(), {
      ...options,
      headers,
    });
  }
}
