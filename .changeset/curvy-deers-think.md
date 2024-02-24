---
"@ts-ghost/core-api": major
---

API Composer now require an HTTPClientFactory instead of a HTTPClient.

Passing directly an instanciated HTTPClient was creating a lot of issues with the HttpClient lifecycle. Now, you need to pass a factory that will be used to create a new HttpClient for each request.

The HTTPClientFactory takes the same parameters as the HttpClient constructor, so you can pass the same configuration.

```typescript
export type HTTPClientOptions = {
  key: string;
  version: APICredentials["version"];
  url: APICredentials["url"];
  endpoint: "content" | "admin";
};

export interface IHTTPClientFactory {
  create(config: HTTPClientOptions): HTTPClient;
}

export class HTTPClientFactory implements IHTTPClientFactory {
  constructor(private config: HTTPClientOptions) {}

  public create() {
    return new HTTPClient(this.config);
  }
}
```
