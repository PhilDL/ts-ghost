import { SignJWT } from "jose";

import type { APICredentials, APIResource } from "../schemas";
import { DebugOption, resolveDebugLogger } from "./debug";

export type HTTPClientOptions = {
  key: string;
  version: APICredentials["version"];
  url: APICredentials["url"];
  endpoint: "content" | "admin";
};

export interface IHTTPClient {
  get baseURL(): URL | undefined;
  get jwt(): string | undefined;
  generateJWT(key: string): Promise<string>;
  genHeaders(): Promise<Record<string, string>>;
  fetch({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit & DebugOption;
    pathnameIdentity?: string;
  }): Promise<any>;
  fetchRawResponse({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit & DebugOption;
    pathnameIdentity?: string;
  }): Promise<Response>;
}

export interface IHTTPClientFactory {
  create(config: HTTPClientOptions): HTTPClient;
}

export class HTTPClientFactory implements IHTTPClientFactory {
  constructor(private config: HTTPClientOptions) {}

  public create() {
    return new HTTPClient(this.config);
  }
}

export class HTTPClient<const Options extends HTTPClientOptions = any> implements IHTTPClient {
  private _jwt: string | undefined;
  private _jwtExpiresAt: number | undefined;
  protected _baseURL: URL | undefined = undefined;

  constructor(protected config: Options) {
    let prefixPath = new URL(config.url).pathname;
    if (prefixPath.slice(-1) === "/") {
      prefixPath = prefixPath.slice(0, -1);
    }

    this._baseURL = new URL(`${prefixPath}/ghost/api/${config.endpoint}/`, config.url);
  }

  get baseURL() {
    return this._baseURL;
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
        Uint8Array.from((_secret.match(/.{1,2}/g) as RegExpMatchArray).map((byte) => parseInt(byte, 16))),
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
    options?: RequestInit & DebugOption;
    pathnameIdentity?: string;
  }) {
    const debug = resolveDebugLogger(options);
    if (this._baseURL === undefined) throw new Error("URL is undefined");
    let path = `${resource}/`;
    if (pathnameIdentity !== undefined) {
      path += `${pathnameIdentity}/`;
    }
    const url = new URL(path, this._baseURL);
    if (searchParams !== undefined) {
      for (const [key, value] of searchParams.entries()) {
        url.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      url.searchParams.append("key", this.config.key);
    }
    let result = undefined;
    const headers = await this.genHeaders();
    debug("url", url.toString(), "headers", headers, "options", options);
    try {
      result = await (
        await fetch(url.toString(), {
          ...options,
          headers,
        })
      ).json();
    } catch (e) {
      debug("error", e);
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
    if (this._baseURL === undefined) throw new Error("URL is undefined");
    this._baseURL.pathname += `${resource}/`;
    if (pathnameIdentity !== undefined) {
      this._baseURL.pathname += `${pathnameIdentity}/`;
    }
    if (searchParams !== undefined) {
      for (const [key, value] of searchParams.entries()) {
        this._baseURL.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      this._baseURL.searchParams.append("key", this.config.key);
    }
    const headers = await this.genHeaders();
    return await fetch(this._baseURL.toString(), {
      ...options,
      headers,
    });
  }
}
