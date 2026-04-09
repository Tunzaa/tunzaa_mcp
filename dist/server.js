"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunzaaServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
const auth_service_js_1 = require("./services/auth.service.js");
const tunzaa_client_js_1 = require("./services/tunzaa.client.js");
const tools_js_1 = require("./tools.js");
const resources_js_1 = require("./resources.js");
const config_js_1 = require("./config.js");
const schemas_js_1 = require("./schemas.js");
class TunzaaServer {
    server;
    authService;
    client;
    constructor() {
        this.server = new index_js_1.Server({
            name: "tunzaa-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
        this.authService = new auth_service_js_1.AuthService();
        this.client = (0, tunzaa_client_js_1.getTunzaaClient)(this.authService);
        this.setupHandlers();
        this.setupErrorHandling();
    }
    setupHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: tools_js_1.TOOLS,
        }));
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
            resources: resources_js_1.RESOURCES.map(r => ({
                uri: r.uri,
                name: r.name,
                mimeType: r.mimeType,
                description: r.description
            })),
        }));
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            const resource = resources_js_1.RESOURCES.find((r) => r.uri === request.params.uri);
            if (!resource) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
            }
            return {
                contents: [
                    {
                        uri: resource.uri,
                        mimeType: resource.mimeType,
                        text: resource.text,
                    },
                ],
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "get_token":
                        return await this.handleGetToken(schemas_js_1.GetTokenSchema.parse(args));
                    case "initiate_payment":
                        return await this.handleInitiatePayment(schemas_js_1.InitiatePaymentSchema.parse(args));
                    case "get_payment_status":
                        return await this.handleGetPaymentStatus(schemas_js_1.GetPaymentStatusSchema.parse(args));
                    case "handle_callback":
                        return await this.handleCallback(schemas_js_1.HandleCallbackSchema.parse(args));
                    case "create_installment":
                        return await this.handleCreateInstallment(schemas_js_1.CreateInstallmentSchema.parse(args));
                    case "list_installments":
                        return await this.handleListInstallments(schemas_js_1.ListInstallmentsSchema.parse(args));
                    case "get_installment_plan":
                        return await this.handleGetInstallmentPlan(schemas_js_1.GetInstallmentPlanSchema.parse(args));
                    case "edit_installment_plan":
                        return await this.handleEditInstallmentPlan(schemas_js_1.EditInstallmentPlanSchema.parse(args));
                    case "delete_installment_plan":
                        return await this.handleDeleteInstallmentPlan(schemas_js_1.DeleteInstallmentPlanSchema.parse(args));
                    case "create_demo_shop":
                        return await this.handleCreateDemoShop(schemas_js_1.CreateDemoShopSchema.parse(args));
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return this.formatError(error);
            }
        });
    }
    setupErrorHandling() {
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    formatError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message;
            const errorDetails = JSON.stringify(error.response?.data || {});
            return {
                content: [{ type: "text", text: `API Error: ${errorMessage} (Status: ${error.response?.status})\nDetails: ${errorDetails}` }],
                isError: true,
            };
        }
        if (error instanceof types_js_1.McpError) {
            throw error;
        }
        return {
            content: [{ type: "text", text: `Internal Error: ${error.message}` }],
            isError: true,
        };
    }
    // --- Handlers ---
    async handleGetToken(args) {
        const token = await this.authService.ensureToken(args.address);
        return {
            content: [{ type: "text", text: JSON.stringify({ access_token: token }, null, 2) }],
        };
    }
    async handleInitiatePayment(args) {
        const result = await this.client.initiatePayment(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleGetPaymentStatus(args) {
        const result = await this.client.getPaymentStatus(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleCallback(args) {
        return {
            content: [{ type: "text", text: `Received Callback Simulation:\nStatus: ${args.status}\nTransaction: ${args.transaction_id}\n\nPayload Validated.` }]
        };
    }
    async handleCreateInstallment(args) {
        const result = await this.client.createInstallment(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleListInstallments(args) {
        const result = await this.client.listInstallments(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleGetInstallmentPlan(args) {
        const result = await this.client.getInstallmentPlan(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleEditInstallmentPlan(args) {
        const result = await this.client.editInstallmentPlan(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleDeleteInstallmentPlan(args) {
        const result = await this.client.deleteInstallmentPlan(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    async handleCreateDemoShop(args) {
        const results = [];
        const address = args.api_url || config_js_1.config.API_BASE_URL;
        // 1. Get Token
        try {
            const token = await this.authService.ensureToken(address);
            results.push({
                step: "1. Authentication",
                action: "POST /accounts/request/token",
                insight: "Tokens should be stored and reused until they expire (usually 1 hour).",
                result: { access_token: token }
            });
        }
        catch (e) {
            results.push({ step: "Get Token", error: e.message });
        }
        // 2. Initiate Payment
        try {
            const paymentResult = await this.client.initiatePayment({
                customer_msisdn: "0744550667",
                amount: "5000",
                reference: `DEMO-${Date.now()}`,
                address
            });
            results.push({
                step: "2. Initiate Payment",
                action: "POST /payments/initiate-payment",
                insight: "This initiates a Mobile Money push. Store the 'transactionID' to verify later via webhook or status check.",
                result: paymentResult
            });
        }
        catch (e) {
            results.push({ step: "Initiate Payment", error: e.message });
        }
        // 3. Create Installment (BNPL)
        try {
            const installmentResult = await this.client.createInstallment({
                address,
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
            });
            results.push({
                step: "3. Create Installment Plan",
                action: "POST /installments/create",
                insight: "Use this for Bay-Now-Pay-Later flows. The response includes a schedule of payments.",
                result: installmentResult
            });
        }
        catch (e) {
            results.push({ step: "Create Installment", error: e.message });
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        platform_guide: "This sequence demonstrates a full Tunzaa integration. AI agents should use these patterns to build checkout pages and payment handlers.",
                        grounding_trace: results,
                        next_steps: [
                            "Check 'tunzaa://docs/webhooks' to learn how to handle asynchronous status updates.",
                            "Use 'tunzaa://examples/node-express' for a production-ready boilerplate."
                        ]
                    }, null, 2)
                }]
        };
    }
    async run(transport) {
        await this.server.connect(transport);
        console.error("Tunzaa MCP Server running on stdio");
    }
}
exports.TunzaaServer = TunzaaServer;
