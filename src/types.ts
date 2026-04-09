export interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export interface PaymentRequest {
    customer_msisdn: string;
    amount: string;
    reference: string;
    address?: string;
}

export interface PaymentStatusRequest {
    transactionID: string;
    address?: string;
}

export interface CallbackPayload {
    transaction_id: string;
    status: string;
    reference_id?: string;
    amount?: string;
    payment_date?: string;
    timestamp?: string;
}

export interface InstallmentCustomer {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
}

export interface CreateInstallmentRequest {
    customer: InstallmentCustomer;
    name: string;
    description: string;
    total_amount: number;
    payment_frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    start_date: string;
    end_date: string;
    custom_interval?: number;
    address?: string;
}

export interface ListInstallmentsRequest {
    from?: number;
    limit?: number;
    address?: string;
}

export interface GetInstallmentRequest {
    plan_id: number;
    address?: string;
}

export interface EditInstallmentRequest {
    plan_id: number;
    updates: Record<string, any>;
    address?: string;
}

export interface DeleteInstallmentRequest {
    plan_id: number;
    address?: string;
}

export interface DemoShopRequest {
    api_url?: string;
}
