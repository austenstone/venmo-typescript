# Venmo Typescript &middot; [![npm version](https://img.shields.io/npm/v/venmo-typescript.svg?style=flat)](https://www.npmjs.com/package/venmo-typescript)

Typescript/Javascript library for interacting with the [Venmo API](https://github.com/mmohades/VenmoApiDocumentation).

## Examples

### Payment

This example will login and request $1.00 from the users listed in `USERNAMES`.

> `-` Negative amounts are payment requests.<br>`+` Positive amounts are payments.

```typescript
// Create a venmo client.
const v = new Venmo();
await v.easyLogin(process.env.EMAIL, process.env.PASSWORD);

const usernames = process.env.USERNAMES?.split(',') || [];
// For each recipient username
for (const username of usernames) {
    // Query user so we can get the id.
    const userResponse = await v.userQuery(username);
    const user = userResponse?.find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (user) {
        // Request payment with the user id.
        const paymentRes = await v.pay(user.id, -1, 'Note for transaction.', 'private');
    }
}
```

### Deal with 2FA OTP code
You can deal with 2FA by passing a callback function that returns the otp code. In this example we are using stdin to have the user manually type the code they get via SMS.
```typescript
import { Venmo } from "venmo-typescript";
import readline from 'readline';

const v = new Venmo();
await v.easyLogin(process.env.EMAIL, process.env.PASSWORD, async () => {
  return await new Promise((res) => {
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('Enter OTP code:', (answer) => res(answer))
  });
});
```

### Get My Profile

```typescript
import { Venmo } from "venmo-typescript";

const v = new Venmo();
await v.easyLogin(process.env.EMAIL, process.env.PASSWORD);
console.log(await v.getUserProfile());
```

## Manual Login
You can also manually login and manage the otp code yourself. See how [easyLogin](https://github.com/austenstone/venmo-typescript/blob/a3d47c5e86f122815caf92a0bbe054d03d9700b4/src/index.ts#L63) works.
