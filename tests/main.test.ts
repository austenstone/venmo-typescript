import { test, expect } from '@jest/globals';
import { Venmo } from '../src/index';

test('Login works', async () => {
  const v = new Venmo();
  const res = await v.easyLogin(process.env.EMAIL, process.env.PASSWORD);
  expect(res).toBeTruthy();
});


test('Request money works', async () => {
  const v = new Venmo();
  const res = await v.easyLogin(process.env.EMAIL, process.env.PASSWORD);
  expect(res).toBeTruthy();

  const users = process.env.USERNAMES?.split(',') || [];
  for (const username of users) {
    const userResponse = await v.userQuery(username);
    const user = userResponse.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    expect(user).toBeTruthy();
    if (user) {
      const res2 = await v.pay(user.id, -1, 'venmo-typescript test', 'private');
      expect(res2).toBeTruthy();
    }
  }
});