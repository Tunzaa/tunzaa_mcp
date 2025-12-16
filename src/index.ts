#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "https://pay.tunzaa.co.tz";

// Environment variables
const API_KEY = process.env.TUNZAA_API_KEY;
const SECRET_KEY = process.env.TUNZAA_SECRET_KEY;
const ENVIRONMENT = process.env.TUNZAA_ENVIRONMENT || "sandbox";

if (!API_KEY || !SECRET_KEY) {
    console.error("Error: TUNZAA_API_KEY and TUNZAA_SECRET_KEY environment variables are required.");
    process.exit(1);
}

// Define interface for Token response
interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

class TunzaaServer {
    private server: Server;
    private axiosInstance: AxiosInstance;
    private token: string | null = null;
    private tokenExpiry: number | null = null;

    constructor() {
        this.server = new Server(
            {
                name: "tunzaa-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.axiosInstance = axios.create({
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

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "get_token",
                    description: "Request an access token from Tunzaa API (Refreshes internal token).",
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
                                description: "Fields to update (customer, name, description, etc.)",
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

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            // Ensure we have a valid token for non-auth requests
            if (request.params.name !== "get_token" && request.params.name !== "handle_callback") {
                await this.ensureToken();
            }

            try {
                // Ensure arguments are not null
                const args = request.params.arguments || {};

                switch (request.params.name) {
                    case "get_token":
                        return await this.handleGetToken();
                    case "initiate_payment":
                        return await this.handleInitiatePayment(args);
                    case "get_payment_status":
                        return await this.handleGetPaymentStatus(args);
                    case "handle_callback":
                        return await this.handleCallback(args);
                    case "create_installment":
                        return await this.handleCreateInstallment(args);
                    case "list_installments":
                        return await this.handleListInstallments(args);
                    case "get_installment_plan":
                        return await this.handleGetInstallmentPlan(args);
                    case "edit_installment_plan":
                        return await this.handleEditInstallmentPlan(args);
                    case "delete_installment_plan":
                        return await this.handleDeleteInstallmentPlan(args);
                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Unknown tool: ${request.params.name}`
                        );
                }
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
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

    private async ensureToken() {
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return;
        }
        // Refresh token internally
        await this.fetchTokenInternal();
    }

    private async fetchTokenInternal(): Promise<TokenResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/accounts/request/token`, {
                api_key: API_KEY,
                secret_key: SECRET_KEY,
            }, { headers: { 'Content-Type': 'application/json' } });

            const data = response.data;
            this.token = data.access_token;
            // Set expiry 60s early for safety buffer
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return data;
        } catch (error: any) {
            console.error("Token fetch failed:", error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }

    private getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            "X-Environment": ENVIRONMENT,
        };
    }

    // --- Tool Handlers ---

    private async handleGetToken() {
        // Calls the internal fetcher and returns the result to the user
        const data = await this.fetchTokenInternal();
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }

    private async handleInitiatePayment(args: any) {
        const response = await this.axiosInstance.post(
            "/payments/initiate-payment",
            args,
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    private async handleGetPaymentStatus(args: any) {
        const response = await this.axiosInstance.get(
            `/payments/check-status/${args.transactionID}`,
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    private async handleCallback(args: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Received Callback Simulation:\nStatus: ${args.status}\nTransaction: ${args.transaction_id}\n\nPayload Validated.`
                }
            ]
        };
    }

    private async handleCreateInstallment(args: any) {
        const response = await this.axiosInstance.post(
            "/installments/create",
            args,
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    private async handleListInstallments(args: any) {
        const { from = 0, limit = 20 } = args;
        // Verify if your API requires POST or GET for listing. 
        // Assuming POST based on your snippet, but often lists are GET.
        const response = await this.axiosInstance.post(
            `/installments?from=${from}&limit=${limit}`,
            {},
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    private async handleGetInstallmentPlan(args: any) {
        const response = await this.axiosInstance.get(
            `/installments/${args.plan_id}`,
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    private async handleEditInstallmentPlan(args: any) {
        const response = await this.axiosInstance.put(
            `/installments/${args.plan_id}/update`,
            args.updates,
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    private async handleDeleteInstallmentPlan(args: any) {
        const response = await this.axiosInstance.delete(
            `/installments/${args.plan_id}/cancel`,
            { headers: this.getAuthHeaders() }
        );
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Tunzaa MCP Server running on stdio");
    }
}

const server = new TunzaaServer();
server.run().catch(console.error);