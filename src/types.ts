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

export interface Payment {
    balance: string;
    payment: PaymentClass;
    payment_token: null;
}

export interface PaymentClass {
    status: string;
    refund: null;
    medium: string;
    id: string;
    date_authorized: null;
    fee: null;
    date_completed: null;
    target: Target;
    audience: string;
    actor: User;
    note: string;
    amount: number;
    action: string;
    date_created: string;
    date_reminded: null;
    external_wallet_payment_info: null;
}

export interface Target {
    merchant: null;
    redeemable_target: null;
    phone: null;
    user: User;
    type: string;
    email: null;
}

export interface PaymentMethods {
    top_up_role:                  string;
    default_transfer_destination: string;
    fee:                          null;
    last_four:                    null | string;
    id:                           string;
    card:                         null;
    assets:                       Assets | null;
    peer_payment_role:            string;
    name:                         string;
    image_url:                    null | string;
    bank_account:                 BankAccount | null;
    merchant_payment_role:        string;
    type:                         string;
}

export interface Assets {
    detail:    string;
    thumbnail: string;
}

export interface BankAccount {
    is_verified: boolean;
    id:          string;
    bank:        Bank;
}

export interface Bank {
    asset_name: string;
    name:       string;
}
