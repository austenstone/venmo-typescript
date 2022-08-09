import axios, { AxiosResponse } from 'axios';

import { Access, Payment, PaymentMethods, User } from './types';

export class Venmo {
  private static base = 'https://api.venmo.com/v1';
  deviceId: string;
  access: Access | undefined;

  constructor(deviceId?: string) {
    this.deviceId = deviceId || '88884260-05O3-8U81-58I1-2WA76F357GR9';
    this.access = undefined;
  }

  private _fetch = async (
    method: string, path: string, body: any, headers?: any, options?: any
  ): Promise<AxiosResponse> => axios(`${Venmo.base}/${path}`, {
    method: method,
    data: body,
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Venmo/9.26.0 (iPhone; iOS 10.3.2; Scale/2.00)',
      ...headers,
    },
    ...options
  }).catch(err => {
    console.error(method, path, err.response.data);
    return err.response;
  });

  login = async (phoneEmailUsername: string, password: string, headers?: any): Promise<AxiosResponse> => {
    const res = await this._fetch('POST', 'oauth/access_token', {
      phone_email_or_username: phoneEmailUsername,
      client_id: 1,
      password: password
    }, {
      'device-id': this.deviceId,
      ...headers
    });
    if (res.status === 201) {
      this.access = await res.data as any;
    }
    return res;
  }

  logout = async (): Promise<void> => {
    const logoutRes = await this.request('DELETE', 'oauth/access_token', {
      client_id: 1,
    });
    if (logoutRes.status === 200) {
      this.access = undefined;
    }
  }

  twoFactorToken = (otpSecret: string): Promise<AxiosResponse> => {
    return this._fetch('POST', `account/two-factor/token`, {
      via: "sms"
    }, {
      'device-id': this.deviceId,
      'venmo-otp-secret': otpSecret,
    });
  }

  /**
   * Easy login that handles 2FA if necessary.
   * @param phoneEmailUsername The phone number, username, or email address
   * @param password The password
   * @returns Access object
   */
  easyLogin = async (phoneEmailUsername: string, password: string, otpCallback?: () => Promise<string>): Promise<Access | void> => {
    const loginRes = await this.login(phoneEmailUsername, password);
    if (loginRes.status === 201) return this.access;

    const otpSecret = loginRes?.headers['venmo-otp-secret'];
    if (!otpSecret) {
      throw new Error('No otp secret');
    }
    const otpRes = await this.twoFactorToken(otpSecret);
    if ([200, 201].includes(otpRes.status)) {
      throw new Error('Two factor request failed');
    }
    if (!otpCallback) {
      throw new Error('No otp callback');
    }
    const otpCode = await otpCallback();
    const otpLogin = await this.login(phoneEmailUsername, password, {
      'venmo-otp-secret': otpSecret,
      'venmo-otp': otpCode
    });
    if ([200, 201].includes(otpLogin?.status || 0)) return this.access;
    throw new Error('Two factor failed. Check code.');
  }

  request = async (method: string, path: string, body?: any): Promise<AxiosResponse> => {
    if (!this.access?.access_token) {
      throw new Error('Not logged in');
    }
    return this._fetch(method, path, body, {
      'Authorization': `Bearer ${this.access.access_token}`,
    });
  }

  private requestJson = async (method: string, path: string, body?: any): Promise<any> => {
    const res = await this.request(method, path, body);
    return res.status === 200 ? res.data : null;
  }

  /**
   * Query for users.
   * @param query The query to search for.
   * @param limit Max number to return.
   * @param offset The offset to start at.
   * @returns Array of users matching query.
   */
  userQuery = async (
    query: string, limit?: number, offset?: number
  ): Promise<User[]> => this.requestJson(
    'GET', `users?query=${query}&limit=${limit || 10}&offset=${offset || 0}`
  ).then(res => res ? res.data : []);

  /**
   * Pay or Request money from a user.
   * @param userId The user id to get payments for
   * @param amount Amount. Negative(-) to request, positive(+) to pay
   * @param note The note to attach to the payment
   * @param audience The audience to send the payment to
   * @returns The payment response object
   */
  pay = async (
    userId: string, amount: number, note?, audience?: 'private' | 'public'
  ): Promise<Payment> => this.requestJson('POST', 'payments', {
    user_id: userId,
    amount: amount,
    note: note,
    audience: audience ? audience : 'private'
  });

  /**
   * Get current user's profile
   * @returns The current user's profile
   */
  getMyProfile = async (): Promise<User> => this.requestJson('GET', 'me');

  /**
   * Get a user profile
   * @param userId The user id
   * @returns The user profile
   */
  getUserProfile = async (userId: string): Promise<User> => this.requestJson('GET', `users/${userId}`);

  /**
   * Get a user's friend list
   * @param userId The user id
   * @param limit Max number to return
   * @returns List of users in friends list
   */
  getUserFriendList = async (userId: string, limit?: number): Promise<User[]> => this.requestJson('GET', `users/${userId}/friends?limit=${limit || 10}`);

  /**
   * Get a user's transactions
   * @param userId The user id
   * @returns The user's transactions
   */
  getUserTransactions = async (userId: string): Promise<User[]> => this.requestJson('GET', `stories/target-or-actor/${userId}`);

  /**
   * Get current user's payment methods
   * @returns The current user's payment methods
   */
  getPaymentMethods = async (): Promise<PaymentMethods> => this.requestJson('GET', `payment-methods`);

  /**
   * Get a transaction by id
   * @param transactionId The transaction id
   * @returns The transaction
   */
  getTransaction = async (transactionId: string): Promise<User[]> => this.requestJson('GET', `stories/${transactionId}`);
}