import { test, expect } from '@jest/globals';
import { Venmo } from '../src/index';
import { User } from '../src/types';
import readline from 'readline';

test('Login works', async () => {
  const v = new Venmo();
  if (process.env.EMAIL && process.env.PASSWORD) {
    const res = await v.easyLogin(process.env.EMAIL, process.env.PASSWORD, async () => {
      return await new Promise((resolve) => {
        readline.createInterface({
          input: process.stdin,
          output: process.stdout
        }).question('Enter OTP code:', (answer) => {
          resolve(answer);
        })
      });
    });
    expect(res).toBeTruthy();
  }
  v.logout();
}, 30000);

test('README example works', async () => {
  // Create a venmo client.
  const v = new Venmo();
  const email = process.env.EMAIL || '';
  const password = process.env.PASSWORD || '';
  await v.easyLogin(email, password);
  
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
          await v.pay(user.id, -1, 'Note for transaction.', 'private');
      }
  }
});


describe('API works', () => {
  let v: Venmo;

  beforeAll(async () => {
    v = new Venmo();
    if (process.env.EMAIL && process.env.PASSWORD) {
      const res = await v.easyLogin(process.env.EMAIL, process.env.PASSWORD);
      expect(res).toBeTruthy();
    }
  });

  afterAll(async () => {
    await v.logout();
  });
  
  test('Get my profile', async () => {
    const myProfile = await v.getMyProfile();
    expect(myProfile).toBeTruthy();
  });

  test('Get payment methods', async () => {
    const paymentMethods = await v.getPaymentMethods();
    expect(paymentMethods).toBeTruthy();
  });

  describe('Get user', () => {
    let user: User;
    beforeAll(async () => {
      const usernames = process.env.USERNAMES?.split(',') || [];
      const username = usernames[0];
      const userResponse = await v.userQuery(username);
      user = userResponse.find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      ) || userResponse[0];
      expect(user).toBeTruthy();
    });
    
    test('Request money works', async () => {
      const res2 = await v.pay(user.id, -1, 'venmo-typescript test', 'private');
      expect(res2).toBeTruthy();
    });

    test('Get user profile works', async () => {
      const res2 = await v.getUserProfile(user.id);
      expect(res2).toBeTruthy();
    });

    test('Get user friends list works', async () => {
      const res2 = await v.getUserFriendList(user.id);
      expect(res2).toBeTruthy();
    });

    test('Get user transactions works', async () => {
      const res2 = await v.getUserTransactions(user.id);
      expect(res2).toBeTruthy();
    });
  });
});
