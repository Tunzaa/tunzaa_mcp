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
    console.error("Error: TUNZAA_API_KEY and TUNZAA_SECRET_KEY environment variables are required.");
    process.exit(1);
}
class TunzaaServer {
    server;
    axiosInstance;
    token = null;
    tokenExpiry = null;
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
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "get_token",
                    description: "Request an access token from Tunzaa API.",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
                {
                    name: "initiate_payment",
                    description: "Initiate a payment request (M-Pesa, etc.) via Tunzaa.",
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
                    name: "get_payment_status",
                    description: "Check the status of a payment transaction.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            transactionID: { type: "string", description: "Transaction ID returned from initiate_payment" },
                        },
                        required: ["transactionID"],
                    },
                },
                {
                    name: "handle_callback",
                    description: "Simulate or validate a Tunzaa payment callback payload.",
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
                    name: "create_installment",
                    description: "Create a new installment plan.",
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
                                required: ["first_name", "last_name", "phone"],
                            },
                            name: { type: "string", description: "Plan name (e.g., 'Samsung S20')" },
                            description: { type: "string" },
                            total_amount: { type: "number" },
                            payment_frequency: { type: "string", description: "'daily', 'weekly', 'monthly', or 'custom'" },
                            start_date: { type: "string", description: "YYYY-MM-DD" },
                            end_date: { type: "string", description: "YYYY-MM-DD" },
                            custom_interval: { type: "number", description: "Days between payments if frequency is 'custom'" },
                        },
                        required: ["customer", "name", "total_amount", "payment_frequency", "start_date", "end_date"],
                    },
                },
                {
                    name: "list_installments",
                    description: "List installment plans with pagination.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            from: { type: "number", description: "Pagination offset", default: 0 },
                            limit: { type: "number", description: "Items per page", default: 20 },
                        },
                    },
                },
                {
                    name: "get_installment_plan",
                    description: "Get details of a specific installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            plan_id: { type: "number" },
                        },
                        required: ["plan_id"],
                    },
                },
                {
                    name: "edit_installment_plan",
                    description: "Update an existing installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            plan_id: { type: "number" },
                            updates: {
                                type: "object",
                                description: "Fields to update (customer, name, description, etc.) - same structure as create_installment",
                            },
                        },
                        required: ["plan_id", "updates"],
                    },
                },
                {
                    name: "delete_installment_plan",
                    description: "Cancel/Delete an installment plan.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            plan_id: { type: "number" },
                        },
                        required: ["plan_id"],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            // Ensure we have a valid token for non-auth requests
            if (request.params.name !== "get_token" && request.params.name !== "handle_callback") {
                await this.ensureToken();
            }
            try {
                switch (request.params.name) {
                    case "get_token":
                        return await this.handleGetToken();
                    case "initiate_payment":
                        return await this.handleInitiatePayment(request.params.arguments);
                    case "get_payment_status":
                        return await this.handleGetPaymentStatus(request.params.arguments);
                    case "handle_callback":
                        return await this.handleCallback(request.params.arguments);
                    case "create_installment":
                        return await this.handleCreateInstallment(request.params.arguments);
                    case "list_installments":
                        return await this.handleListInstallments(request.params.arguments);
                    case "get_installment_plan":
                        return await this.handleGetInstallmentPlan(request.params.arguments);
                    case "edit_installment_plan":
                        return await this.handleEditInstallmentPlan(request.params.arguments);
                    case "delete_installment_plan":
                        return await this.handleDeleteInstallmentPlan(request.params.arguments);
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const errorMessage = error.response?.data?.message || error.message;
                    return {
                        content: [
                            {
                                type: "text",
                                text: `API Error: ${errorMessage} (Status: ${error.response?.status})`,
                            },
                        ],
                        isError: true,
                    };
                }
                throw error;
            }
        });
    }
    async ensureToken() {
        // Basic token caching logic
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return;
        }
        // Refresh token
        const result = await this.handleGetToken();
        // handleGetToken sets this.token internally if successful, but returns content to user.
        // If it failed, it throws or returns error content.
    }
    async handleGetToken() {
        try {
            const response = await axios_1.default.post(`${API_BASE_URL}/accounts/request/token`, {
                api_key: API_KEY,
                secret_key: SECRET_KEY,
            }, { headers: { 'Content-Type': 'application/json' } });
            const data = response.data;
            this.token = data.access_token;
            // Set expiry a bit earlier than actual to be safe (e.g., minus 60s)
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }
        catch (error) {
            console.error(error);
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }
    getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            "X-Environment": "sandbox", // Make this configurable if needed
        };
    }
    async handleInitiatePayment(args) {
        const response = await this.axiosInstance.post("/payments/initiate-payment", args, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleGetPaymentStatus(args) {
        const response = await this.axiosInstance.get(`/payments/check-status/${args.transactionID}`, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleCallback(args) {
        // Since this is a server handling callbacks from Tunzaa, this tool primarily
        // serves to "parse" or "validate" what a callback looks like for the user,
        // or to verify a payload they received.
        // In a real scenario, this server would listen on an HTTP endpoint.
        // Here we just echo back that the payload is valid Tunzaa format.
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
        const response = await this.axiosInstance.post("/installments/create", args, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleListInstallments(args) {
        const { from = 0, limit = 20 } = args;
        const response = await this.axiosInstance.post(`/installments?from=${from}&limit=${limit}`, {}, // Body likely empty or filters? User example showed GET-like params but on POST
        { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleGetInstallmentPlan(args) {
        const response = await this.axiosInstance.get(`/installments/${args.plan_id}`, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleEditInstallmentPlan(args) {
        const response = await this.axiosInstance.put(`/installments/${args.plan_id}/update`, args.updates, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async handleDeleteInstallmentPlan(args) {
        const response = await this.axiosInstance.delete(`/installments/${args.plan_id}/cancel`, { headers: this.getAuthHeaders() });
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error("Tunzaa MCP Server running on stdio");
    }
}
const server = new TunzaaServer();
server.run().catch(console.error);
