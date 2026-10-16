export interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export interface PaymentRequest {
    customer_msisdn: string;
    amount: string;
    reference: string;
    sandbox_scenario?: "success" | "failure";
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
    x_signature?: string;
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
    include_payments?: boolean;
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

// --- Commerce (soko marketplace) ---

export interface SearchProductsRequest {
    query?: string;
    limit?: number;
    skip?: number;
}

export interface GetProductRequest {
    product_id?: string;
    slug?: string;
}

export interface CreateCartRequest {
    session_id?: string;
}

export interface AddToCartRequest {
    cart_id: string;
    product_id: string;
    quantity: number;
    sku?: string;
}

export interface ViewCartRequest {
    cart_id: string;
}

export interface CommerceShippingAddress {
    first_name: string;
    last_name: string;
    phone: string;
    address_line1: string;
    city: string;
    state_province: string;
    country: string;
    address_line2?: string;
    postal_code?: string;
    email?: string;
}

export interface CreateOrderRequest {
    cart_id: string;
    shipping: CommerceShippingAddress;
    notes?: string;
}

export interface PayOrderRequest {
    order_number: string;
    customer_msisdn: string;
}
