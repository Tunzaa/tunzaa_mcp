"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommerceClient = exports.MockCommerceClient = exports.LiveCommerceClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("../config.js");
const crypto_1 = require("crypto");
const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
/**
 * Talks to the Tunzaa marketplace (soko) API as a guest buyer. Every call is
 * scoped to a single tenant via the X-Tenant-ID header. There are intentionally
 * no per-call base-URL overrides: the operator sets MALIPO_COMMERCE_BASE_URL
 * once (defaults to the demo gateway) and every request goes there.
 */
class LiveCommerceClient {
    baseURL;
    constructor() {
        this.baseURL = stripTrailingSlash(config_js_1.config.COMMERCE_BASE_URL);
    }
    http() {
        return axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                "X-Tenant-ID": config_js_1.config.TENANT_ID,
                "Content-Type": "application/json",
            },
        });
    }
    async searchProducts(args) {
        const params = { query: args.query ?? "" };
        if (args.limit !== undefined)
            params.limit = args.limit;
        if (args.skip !== undefined)
            params.skip = args.skip;
        const response = await this.http().get("/v1/products/search", { params });
        return response.data;
    }
    async getProduct(args) {
        const path = args.product_id
            ? `/v1/products/${encodeURIComponent(args.product_id)}`
            : `/v1/products/slug/${encodeURIComponent(args.slug)}`;
        const response = await this.http().get(path);
        return response.data;
    }
    async createCart(args) {
        // The marketplace creates-or-gets a guest cart for a session id.
        const sessionId = args.session_id || `mcp-${(0, crypto_1.randomUUID)()}`;
        const response = await this.http().get("/v1/carts/session", {
            params: { session_id: sessionId },
        });
        return response.data;
    }
    async addToCart(args) {
        const item = {
            product_id: args.product_id,
            quantity: args.quantity,
        };
        if (args.sku)
            item.sku = args.sku;
        const response = await this.http().post(`/v1/carts/${encodeURIComponent(args.cart_id)}/items`, [item]);
        return response.data;
    }
    async viewCart(args) {
        const client = this.http();
        const [cart, totals] = await Promise.all([
            client.get(`/v1/carts/${encodeURIComponent(args.cart_id)}`),
            client.get(`/v1/carts/${encodeURIComponent(args.cart_id)}/totals`),
        ]);
        return { ...cart.data, totals: totals.data };
    }
    async createOrder(args) {
        const client = this.http();
        // The order's payment amount must match the cart total, so read it back
        // rather than trusting a caller-supplied figure.
        const totals = (await client.get(`/v1/carts/${encodeURIComponent(args.cart_id)}/totals`)).data;
        const amount = typeof totals?.total === "number" ? totals.total : totals?.total;
        const body = {
            cart_id: args.cart_id,
            shipping_address: {
                first_name: args.shipping.first_name,
                last_name: args.shipping.last_name,
                address_line1: args.shipping.address_line1,
                address_line2: args.shipping.address_line2,
                city: args.shipping.city,
                state_province: args.shipping.state_province,
                postal_code: args.shipping.postal_code,
                country: args.shipping.country,
                phone: args.shipping.phone,
                email: args.shipping.email,
            },
            payment_details: {
                method: "mobile_money",
                amount,
                currency: config_js_1.config.CURRENCY,
                payment_gateway: "tunzaa",
            },
            notes: args.notes,
        };
        const response = await client.post("/v1/orders/", body);
        return response.data;
    }
    async payOrder(args) {
        const response = await this.http().post(`/v1/orders/${encodeURIComponent(args.order_number)}/pay`, { customer_msisdn: args.customer_msisdn });
        return response.data;
    }
}
exports.LiveCommerceClient = LiveCommerceClient;
/**
 * Returns static example data so agents can be grounded on the commerce flow
 * without a tenant id or any network access. Active whenever MALIPO_TENANT_ID
 * is unset.
 */
class MockCommerceClient {
    product() {
        return {
            product_id: "MOCK_PROD_1",
            name: "Demo Smartphone X1 (MOCK)",
            slug: "demo-smartphone-x1",
            description: "Example product for grounding the commerce flow.",
            price: 250000,
            currency: "TZS",
            vendor_id: "MOCK_VENDOR_1",
            store_id: "MOCK_STORE_1",
        };
    }
    async searchProducts(_args) {
        return { items: [this.product()], total: 1, skip: 0, limit: 20 };
    }
    async getProduct(_args) {
        return this.product();
    }
    async createCart(_args) {
        return {
            cart_id: "MOCK_CART_1",
            session_id: "mock-session",
            items: [],
            currency: "TZS",
        };
    }
    async addToCart(args) {
        return {
            cart_id: args.cart_id,
            items: [
                {
                    item_id: "MOCK_ITEM_1",
                    product_id: args.product_id,
                    product_name: "Demo Smartphone X1 (MOCK)",
                    quantity: args.quantity,
                    unit_price: 250000,
                    subtotal: 250000 * args.quantity,
                },
            ],
        };
    }
    async viewCart(args) {
        return {
            cart_id: args.cart_id,
            items: [
                {
                    item_id: "MOCK_ITEM_1",
                    product_id: "MOCK_PROD_1",
                    quantity: 1,
                    unit_price: 250000,
                    subtotal: 250000,
                },
            ],
            totals: { subtotal: 250000, discount: 0, tax: 0, total: 250000 },
        };
    }
    async createOrder(args) {
        return {
            order_id: "MOCK_ORDER_1",
            order_number: "ORD-MOCK-0001",
            cart_id: args.cart_id,
            status: "PENDING",
            payment_status: "pending",
            shipping_address: args.shipping,
            totals: { subtotal: 250000, discount: 0, tax: 0, total: 250000 },
            currency: "TZS",
            note: "MOCK order. Call pay_order to simulate the payment step.",
        };
    }
    async payOrder(args) {
        return {
            success: true,
            message: "Payment push initiated (MOCK)",
            order_number: args.order_number,
            customer_msisdn: args.customer_msisdn,
            transactionID: "MOCK_TXN_COMMERCE_1",
        };
    }
}
exports.MockCommerceClient = MockCommerceClient;
const getCommerceClient = () => config_js_1.isCommerceMockMode ? new MockCommerceClient() : new LiveCommerceClient();
exports.getCommerceClient = getCommerceClient;
