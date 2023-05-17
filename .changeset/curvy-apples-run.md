---
"@ts-ghost/content-api": major
---

Refactoring fetch for NextJS Compatiblity

## Breaking Changes

Pretty much all API changed to be fetch agnostic. Since cross-fetch was removed, ts-ghost now assumes you bring your own fetch. Using the API with NextJS we noticed that the admin queries were not cached effectively, because the signature of the cache chnged due to the computed JWT token put in the Auth Header.

Fetching is now encapsulated in a `HTTPClient` class that is created from the consumers (content-api, admin-api) one time. And a mechanism is in place to autoregenerate the token if it is expired (on the same object instance).

This allows the users of the content and admin api clients to implement patterns where they instantiate one time the client and then will benefit from the cache as long as the token is valid.

The signature of the APIComposer, all the Fetchers changed accordingly to accept the HTTPClient as a parameter. The logic of creating a correct URL is now encapsulated in the HTTPClient instead of the fetchers. Fetchers are responsible to create the correct body and query parameters and then delegates to the HTTPClient.
