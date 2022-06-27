# Venmo Typescript

Typescript/Javascript library for interacting with the [Venmo API](https://github.com/mmohades/VenmoApiDocumentation).

## Example

```typescript
import { Venmo } from "venmo-typescript";

// Create a venmo client.
const v = new Venmo();
await v.easyLogin(process.env.EMAIL, process.env.PASSWORD);

const usernames = process.env.USERNAMES?.split(',') || [];
// For each recipient username
for (const username of usernames) {
  // Query user so we can get the id.
  const user = await v.userQuery(username)?.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );
  if (user) {
    // Request payment with the user id.
    const paymentRes = await v.pay(user.id, -1, 'venmo-typescript test', 'private');
  }
}
```

## Payments
Negative amounts are requests to pay. Positive amounts are payments.

## Manual Login
You can also manually login and manage the otp code yourself. See how [easyLogin](https://github.com/austenstone/venmo-typescript/blob/main/src/index.ts#L85-L118) works.