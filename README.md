# Venmo API

Typescript/Javascript library for interacting with the Venmo API.

## Example

```typescript
import { Venmo } from "venmo-api";

const username = "username or email or phone";
const password = "password";
const venmo = new Venmo();
await venmo.login(username, password);

const query = "user123";
const users = await venmo.userQuery(query);
const user = users.find(
  (user) => user.username.toLowerCase() === query.toLowerCase()
);
if (user) {
  await venmo.pay(user.id, 1, "Payment Note");
}
```

## Manual Login
You can also manually login and manage the otp code yourself. See how [easyLogin](./src/easyLogin) works.