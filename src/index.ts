import fetch, { Response } from 'node-fetch';
import readline from 'readline';

export interface Access {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: User;
  balance: number;
  refresh_token: string;
}

export interface User {
  username: string;
  last_name: string;
  friends_count: number;
  is_group: boolean;
  is_active: boolean;
  trust_request: null;
  is_venmo_team: boolean;
  phone: string;
  profile_picture_url: string;
  is_payable: boolean;
  is_blocked: boolean;
  id: string;
  identity: null;
  date_joined: string;
  about: string;
  display_name: string;
  identity_type: string;
  audience: string;
  first_name: string;
  friend_status: null;
  email: string;
}

export class Venmo {
  private static base = 'https://api.venmo.com/v1';
  deviceId = '88884260-05O3-8U81-58I1-2WA76F357GR9';
  access: Access | undefined;

  constructor(deviceId?) {
    this.deviceId = deviceId || '88884260-05O3-8U81-58I1-2WA76F357GR9';
    this.access = undefined;
  }

  private _fetch = async (method, path, body, headers?, options?): Promise<Response> => {
    console.debug('->', path, body, headers);
    return fetch(`${Venmo.base}/${path}`, {
      method: method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...options
    }).then(res => {
      console.debug('<-', res)
      return res;
    });
  }

  login = async (phoneEmailUsername, password, headers?): Promise<Response | undefined> => {
    const res = await this._fetch('POST', 'oauth/access_token', {
      phone_email_or_username: phoneEmailUsername,
      client_id: 1,
      password: password
    }, {
      'device-id': this.deviceId,
      ...headers
    });
    this.access = await res.json();
    return res;
  }

  twoFactorToken = (otpSecret): Promise<Response> => {
    return this._fetch('POST', `account/two-factor/token`, {
      via: "sms"
    }, {
      'device-id': this.deviceId,
      'venmo-otp-secret': otpSecret,
    });
  }

  easyLogin = async (phoneEmailUsername, password): Promise<Access | void> => {
    const loginRes = await this.login(phoneEmailUsername, password);
    if (loginRes.ok) return this.access;

    const otpSecret = loginRes.headers.get('venmo-otp-secret');
    if (!otpSecret) {
      throw new Error('No otp secret');
    }
    const otpRes = await this.twoFactorToken(otpSecret);
    if (!otpRes.ok) {
      throw new Error('Two factor request failed');
    }
    const otpCode = await new Promise((res) => {
      readline.createInterface({
        input: process.stdin,
        output: process.stdout
      }).question('Enter OTP code:', (answer) => res(answer))
    });
    const otpLogin = await this.login(phoneEmailUsername, password, {
      'venmo-otp-secret': otpSecret,
      'venmo-otp': otpCode
    });
    if (otpLogin.ok) return this.access;
    throw new Error('Two factor failed. Check code.');
  }

  request = async (method, path, body?): Promise<Response> => {
    if (!this.access?.access_token) {
      throw new Error('Not logged in');
    }
    return this._fetch(method, path, body, {
      'Authorization': `Bearer ${this.access.access_token}`,
    });
  }

  userQuery = async (query): Promise<User[]> => {
    return this.request('GET', `users?query=${query}&limit=10&offset=0`).then(res => {
      if (res.ok) {
        return res.json().then(json => json.data);
      }
      return [];
    });
  }

  pay = async (userId, amount, note?, audience?: 'private' | 'public'): Promise<any> => {
    return this.request('POST', 'payments', {
      user_id: userId,
      amount: amount,
      note: note,
      audience: audience ? audience : 'private'
    });
  }
}