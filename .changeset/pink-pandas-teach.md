---
"@ts-ghost/core-api": patch
---

fix bug of parsing response when publishing a post with a newsletter. The email object was not correct, schema was out of date with the new lexical norm:

- `plaintext`, `html` are now nullable
- `source` is a new string containing the lexical tree
