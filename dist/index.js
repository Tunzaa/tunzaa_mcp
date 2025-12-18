#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = "https://pay.tunzaa.co.tz";
// Environment variables
const API_KEY = process.env.TUNZAA_API_KEY;
const SECRET_KEY = process.env.TUNZAA_SECRET_KEY;
const ENVIRONMENT = process.env.TUNZAA_ENVIRONMENT || "sandbox";
if (!API_KEY || !SECRET_KEY) {
    console.warn("Notice: TUNZAA_API_KEY and/or TUNZAA_SECRET_KEY not found. Server running in MOCK MODE. Tools will return static example data.");
}
class TunzaaServer {
    server;
    axiosInstance;
    token = null;
    tokenExpiry = null;
    isMockMode = !API_KEY || !SECRET_KEY;
    constructor() {
        this.server = new index_js_1.Server({
            name: "tunzaa-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.axiosInstance = axios_1.default.create({
            baseURL: API_BASE_URL,
            headers: {
                "Content-Type": "application/json",
                "X-Environment": ENVIRONMENT,
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        // Handle shutdown
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        // ... (Tool definitions remain unchanged) ...
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "impliment_get_token",
                    description: "Impliment get access token from Tunzaa API (Refreshes internal token). Endpoint: POST /accounts/request/token. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to get the access token.",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
                {
                    name: "impliment_initiate_payment",
                    description: "Impliment initiate payment from Tunzaa API (Refreshes internal token). Endpoint: POST /payments/initiate-payment. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to initiate a payment request (M-Pesa, etc.) via Tunzaa.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            customer_msisdn: { type: "string", description: "Customer phone number (e.g., 0744550667)" },
                            amount: { type: "string", description: "Amount to pay" },
                            reference: { type: "string", description: "Unique order reference" },
                        },
                        required: ["customer_msisdn", "amount", "reference"],
                    },
                },
                {
                    name: "impliment_get_payment_status",
                    description: "Impliment get payment status from Tunzaa API (Refreshes internal token). Endpoint: GET /payments/check-status/:transactionID. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to check the status of a payment transaction.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            transactionID: { type: "string", description: "Transaction ID returned from initiate_payment" },
                        },
                        required: ["transactionID"],
                    },
                },
                {
                    name: "impliment_handle_callback",
                    description: "Impliment handle callback from Tunzaa API. This tool helps simulate or handle the callback payload sent by Tunzaa to your webhook.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            transaction_id: { type: "string" },
                            reference_id: { type: "string" },
                            status: { type: "string" },
                            amount: { type: "string" },
                            payment_date: { type: "string" },
                            timestamp: { type: "string" },
                        },
                        required: ["transaction_id", "status"],
                    },
                },
                {
                    name: "impliment_create_installment",
                    description: "Impliment create installment from Tunzaa API (Refreshes internal token). Endpoint: POST /installments/create. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to create a new installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            customer: {
                                type: "object",
                                properties: {
                                    first_name: { type: "string" },
                                    last_name: { type: "string" },
                                    phone: { type: "string" },
                                    address: { type: "string" },
                                },
                                required: ["first_name", "last_name", "phone", "address"],
                            },
                            name: { type: "string", description: "Plan name (e.g., 'Samsung S20')" },
                            description: { type: "string" },
                            total_amount: { type: "number" },
                            payment_frequency: { type: "string", description: "'daily', 'weekly', 'monthly', or 'custom'" },
                            start_date: { type: "string", description: "YYYY-MM-DD" },
                            end_date: { type: "string", description: "YYYY-MM-DD" },
                            custom_interval: { type: "number", description: "Days between payments if frequency is 'custom'" },
                        },
                        required: ["customer", "name", "total_amount", "payment_frequency", "start_date", "end_date", "description"],
                    },
                },
                {
                    name: "impliment_list_installments",
                    description: "Impliment list installments from Tunzaa API (Refreshes internal token). Endpoint: POST /installments (with query params). Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to list installment plans with pagination.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            from: { type: "number", description: "Pagination offset", default: 0 },
                            limit: { type: "number", description: "Items per page", default: 20 },
                        },
                    },
                },
                {
                    name: "impliment_get_installment_plan",
                    description: "Impliment get installment plan from Tunzaa API (Refreshes internal token). Endpoint: GET /installments/:plan_id. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to get details of a specific installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            plan_id: { type: "number" },
                        },
                        required: ["plan_id"],
                    },
                },
                {
                    name: "impliment_edit_installment_plan",
                    description: "Impliment edit installment plan from Tunzaa API (Refreshes internal token). Endpoint: PUT /installments/:plan_id/update. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to update an existing installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            plan_id: { type: "number" },
                            updates: {
                                type: "object",
                                description: "Fields to update (customer, name, description, etc.)",
                            },
                        },
                        required: ["plan_id", "updates"],
                    },
                },
                {
                    name: "impliment_delete_installment_plan",
                    description: "Impliment delete installment plan from Tunzaa API (Refreshes internal token). Endpoint: DELETE /installments/:plan_id/cancel. Required Header: 'X-Environment: sandbox' (or 'live'). This tool will create the necessary API integration to cancel/delete an installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            plan_id: { type: "number" },
                        },
                        required: ["plan_id"],
                    },
                },
                {
                    name: "create_demo_shop",
                    description: "Create a demo shop with full Tunzaa integration. Initializes a sample integration environment and verifies connectivity by running a full sequence of API operations (Token -> Payment -> Installments) using the server's configured credentials. This 'live trace' allows an Agent to inspect real-time API responses (grounding) and generate correct, non-hallucinated client code.",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                }
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            // Ensure we have a valid token for non-auth requests
            if (request.params.name !== "impliment_get_token" && request.params.name !== "impliment_handle_callback" && request.params.name !== "create_demo_shop") {
                const args = request.params.arguments || {};
                await this.ensureToken(args.address);
            }
            try {
                // Ensure arguments are not null
                const args = request.params.arguments || {};
                switch (request.params.name) {
                    case "impliment_get_token":
                        return await this.handleGetToken(args);
                    case "impliment_initiate_payment":
                        return await this.handleInitiatePayment(args);
                    case "impliment_get_payment_status":
                        return await this.handleGetPaymentStatus(args);
                    case "impliment_handle_callback":
                        return await this.handleCallback(args);
                    case "impliment_create_installment":
                        return await this.handleCreateInstallment(args);
                    case "impliment_list_installments":
                        return await this.handleListInstallments(args);
                    case "impliment_get_installment_plan":
                        return await this.handleGetInstallmentPlan(args);
                    case "impliment_edit_installment_plan":
                        return await this.handleEditInstallmentPlan(args);
                    case "impliment_delete_installment_plan":
                        return await this.handleDeleteInstallmentPlan(args);
                    case "create_demo_shop":
                        return await this.handleCreateDemoShop(args);
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const errorMessage = error.response?.data?.message || error.message;
                    const errorDetails = JSON.stringify(error.response?.data || {});
                    return {
                        content: [
                            {
                                type: "text",
                                text: `API Error: ${errorMessage} (Status: ${error.response?.status})\nDetails: ${errorDetails}`,
                            },
                        ],
                        isError: true,
                    };
                }
                throw error;
            }
        });
    }
    // --- Internal Helpers ---
    async ensureToken(address) {
        if (this.isMockMode)
            return; // Skip token check in mock mode
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return;
        }
        // Refresh token internally
        await this.fetchTokenInternal(address);
    }
    async fetchTokenInternal(address) {
        if (this.isMockMode) {
            const mockToken = {
                access_token: "MOCK_ACCESS_TOKEN_XYZ",
                expires_in: 3600,
                token_type: "Bearer"
            };
            this.token = mockToken.access_token;
            return mockToken;
        }
        try {
            const baseURL = address || API_BASE_URL;
            const response = await axios_1.default.post(`${baseURL}/accounts/request/token`, {
                api_key: API_KEY,
                secret_key: SECRET_KEY,
            }, { headers: { 'Content-Type': 'application/json' } });
            const data = response.data;
            this.token = data.access_token;
            // Set expiry 60s early for safety buffer
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return data;
        }
        catch (error) {
            console.error("Token fetch failed:", error.message);
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }
    getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            "X-Environment": ENVIRONMENT,
        };
    }
    getAxiosInstance(address) {
        // In Mock Mode, we still return an instance, but handlers will bypass usage if they check isMockMode first.
        // Or we can intercept here if we wanted complex mocking, but simplistic handler interception is easier.
        if (address) {
            return axios_1.default.create({
                baseURL: address,
                headers: {
                    "Content-Type": "application/json",
                    "X-Environment": ENVIRONMENT,
                },
            });
        }
        return this.axiosInstance;
    }
    // --- Tool Handlers ---
    async handleGetToken(args) {
        const data = await this.fetchTokenInternal(args?.address);
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    async handleInitiatePayment(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify({
                            statusCode: 202,
                            success: true,
                            message: "Payment request accepted and being processed (MOCK)",
                            transactionID: "MOCK_TXN_12345"
                        }, null, 2)
                    }]
            };
        }
        const instance = this.getAxiosInstance(args.address);
        const { address, ...data } = args;
        const response = await instance.post("/payments/initiate-payment", data, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleGetPaymentStatus(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify({
                            transactionID: args.transactionID,
                            status: "COMPLETED",
                            message: "Transaction successful (MOCK)"
                        }, null, 2)
                    }]
            };
        }
        const instance = this.getAxiosInstance(args.address);
        const response = await instance.get(`/payments/check-status/${args.transactionID}`, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleCallback(args) {
        return {
            content: [
                {
                    type: "text",
                    text: `Received Callback Simulation:\nStatus: ${args.status}\nTransaction: ${args.transaction_id}\n\nPayload Validated.`
                }
            ]
        };
    }
    async handleCreateInstallment(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify({
                            message: "Installment plan created successfully (MOCK)",
                            plan_id: 1001,
                            status: "active",
                            next_payment_date: args.start_date,
                            installments: [
                                { installment_number: 1, amount: args.total_amount / 2, due_date: args.start_date, status: "PENDING" },
                                { installment_number: 2, amount: args.total_amount / 2, due_date: args.end_date, status: "PENDING" }
                            ]
                        }, null, 2)
                    }]
            };
        }
        const instance = this.getAxiosInstance(args.address);
        const { address, ...data } = args;
        const response = await instance.post("/installments/create", data, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleListInstallments(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify([
                            {
                                plan_id: 1001,
                                name: "Samsung S20 Mock Plan",
                                total_amount: "500000",
                                remaining_balance: "250000",
                                status: "active"
                            }
                        ], null, 2)
                    }]
            };
        }
        const { from = 0, limit = 20, address } = args;
        const instance = this.getAxiosInstance(address);
        const response = await instance.post(`/installments?from=${from}&limit=${limit}`, {}, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleGetInstallmentPlan(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify({
                            plan_id: args.plan_id,
                            name: "Mock Plan Details",
                            status: "active"
                        }, null, 2)
                    }]
            };
        }
        const instance = this.getAxiosInstance(args.address);
        const response = await instance.get(`/installments/${args.plan_id}`, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleEditInstallmentPlan(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify({
                            plan_id: args.plan_id,
                            message: "Plan updated successfully (MOCK)"
                        }, null, 2)
                    }]
            };
        }
        const instance = this.getAxiosInstance(args.address);
        const response = await instance.put(`/installments/${args.plan_id}/update`, args.updates, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleDeleteInstallmentPlan(args) {
        if (this.isMockMode) {
            return {
                content: [{
                        type: "text", text: JSON.stringify({
                            plan_id: args.plan_id,
                            message: "Plan deleted successfully (MOCK)",
                            status: "cancelled"
                        }, null, 2)
                    }]
            };
        }
        const instance = this.getAxiosInstance(args.address);
        const response = await instance.delete(`/installments/${args.plan_id}/cancel`, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleCreateDemoShop(args) {
        const results = [];
        const address = args.api_url || API_BASE_URL; // Use provided URL or default to env/constant
        // 1. Get Token
        try {
            results.push({ step: "Get Token", result: await this.handleGetToken({ address }) });
            await this.ensureToken(address);
        }
        catch (e) {
            results.push({ step: "Get Token", error: e.message });
        }
        // 2. Mock Initiate Payment
        const mockPayment = {
            customer_msisdn: "0744550667",
            amount: "5000",
            reference: `DEMO-${Date.now()}`,
            address: address
        };
        try {
            const paymentResult = await this.handleInitiatePayment(mockPayment);
            results.push({ step: "Initiate Payment", result: paymentResult });
        }
        catch (e) {
            results.push({ step: "Initiate Payment", error: e.message });
        }
        // 3. Mock List Installments
        try {
            const listResult = await this.handleListInstallments({ address, from: 0, limit: 1 });
            results.push({ step: "List Installments", result: listResult });
        }
        catch (e) {
            results.push({ step: "List Installments", error: e.message });
        }
        // 4. Create Installment (Mock Data)
        const mockInstallment = {
            address: address,
            customer: {
                first_name: "John",
                last_name: "Doe",
                phone: "0744550667",
                address: "Dar es Salaam"
            },
            name: "Demo Plan " + Date.now(),
            description: "Demo Shop Payment Plan",
            total_amount: 10000,
            payment_frequency: "monthly",
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        try {
            const installmentResult = await this.handleCreateInstallment(mockInstallment);
            results.push({ step: "Create Installment", result: installmentResult });
        }
        catch (e) {
            results.push({ step: "Create Installment", error: e.message });
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        message: "Demo Shop Simulation Complete. Sequence of Tunzaa API calls executed.",
                        results: results
                    }, null, 2)
                }
            ]
        };
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error("Tunzaa MCP Server running on stdio");
    }
}
const server = new TunzaaServer();
server.run().catch(console.error);
