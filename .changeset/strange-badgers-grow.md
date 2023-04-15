---
"@ts-ghost/content-api": minor
"@ts-ghost/admin-api": minor
"@ts-ghost/ghost-blog-buster": minor
---

## All libraries 
Reflect internal changes to @ts-ghost/core-api in the way the API is composed. There is no impact for end users

## `@ts-ghost/admin-api`

### New feature 
- The `members` resource now have a `add` and `edit` method that allow them to be created and updated.

```ts
  const createNewMember = await api.members.add({ email: "abcdefgh@msn.com" }, { send_email: true });
  assert(createNewMember.status === "success")
  const newMember = createNewMember.data;
  // id => 6438cc365a8fdb00013a8783
  const updateMember = await api.members.edit("6438cc365a8fdb00013a8783", {
    name: "FooBarBaz",
    note: "Hello from ts-ghost",
    labels: [{ name: "ts-ghost" }],
    geolocation: "Reunion",
    stripe_customer_id: "aiuhdiuahzdiuhaizudhaiuzdhiuazd",
  });
  if (updateMember.status === "success") {
    const member = updateMember.data;
    console.log("labels", member.labels);
  }
```