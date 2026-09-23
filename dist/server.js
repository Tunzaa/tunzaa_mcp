"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MalipoServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const auth_service_js_1 = require("./services/auth.service.js");
const tunzaa_client_js_1 = require("./services/tunzaa.client.js");
const tools_js_1 = require("./tools.js");
const resources_js_1 = require("./resources.js");
const config_js_1 = require("./config.js");
const security_js_1 = require("./security.js");
const schemas_js_1 = require("./schemas.js");
class MalipoServer {
    server;
    authService;
    client;
    constructor() {
        this.server = new index_js_1.Server({
            name: "malipo-mcp-server",
            version: "1.1.0",
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
                // Validate address overrides up front so a rejected host fails
                // identically in mock and live mode, before any request is made.
                const overrides = (args ?? {});
                for (const key of ["address", "api_url"]) {
                    if (typeof overrides[key] === "string" && overrides[key]) {
                        (0, security_js_1.resolveBaseUrl)(overrides[key]);
                    }
                }
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
        const { token, expiresAt } = await this.authService.getTokenInfo(args.address);
        const result = {
            access_token: (0, security_js_1.displayToken)(token),
            expires_at: new Date(expiresAt).toISOString(),
        };
        if (!config_js_1.config.EXPOSE_TOKEN) {
            result.note = "Token is masked. The server attaches the full token to API calls itself; set MALIPO_EXPOSE_TOKEN=true to return it.";
        }
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
    canonicalJson(obj) {
        if (obj === null || typeof obj !== "object") {
            return JSON.stringify(obj);
        }
        if (Array.isArray(obj)) {
            return "[" + obj.map(item => this.canonicalJson(item)).join(",") + "]";
        }
        const sortedObj = {};
        for (const key of Object.keys(obj).sort()) {
            sortedObj[key] = obj[key];
        }
        const pairs = Object.entries(sortedObj).map(([key, value]) => `${JSON.stringify(key)}: ${this.canonicalJson(value)}`);
        return "{" + pairs.join(", ") + "}";
    }
    signaturesMatch(expected, received) {
        const expectedBuf = Buffer.from(expected, "utf8");
        const receivedBuf = Buffer.from(received, "utf8");
        // timingSafeEqual throws on length mismatch, so check length first.
        return expectedBuf.length === receivedBuf.length && (0, crypto_1.timingSafeEqual)(expectedBuf, receivedBuf);
    }
    async handleCallback(args) {
        const payload = {
            transaction_id: args.transaction_id,
            status: args.status,
            reference_id: args.reference_id,
            amount: args.amount,
            payment_date: args.payment_date,
            timestamp: args.timestamp,
        };
        // Drop undefined fields so the canonical JSON matches Malipo's payload.
        const cleanPayload = {};
        for (const [key, value] of Object.entries(payload)) {
            if (value !== undefined)
                cleanPayload[key] = value;
        }
        const canonicalBody = this.canonicalJson(cleanPayload);
        const lines = [
            "Received Callback Simulation:",
            `Status: ${args.status}`,
            `Transaction: ${args.transaction_id}`,
            `Reference: ${args.reference_id || "N/A"}`,
            `Amount: ${args.amount || "N/A"}`,
            "",
            "Canonical payload used for HMAC verification:",
            canonicalBody,
        ];
        if (args.x_signature) {
            lines.push("");
            lines.push(`X-Signature: ${args.x_signature}`);
            if (config_js_1.config.SECRET_KEY) {
                const expected = (0, crypto_1.createHmac)("sha256", config_js_1.config.SECRET_KEY)
                    .update(canonicalBody)
                    .digest("hex");
                // Never echo the expected signature: that would let the caller forge
                // valid signatures for arbitrary payloads using the merchant's secret.
                const valid = this.signaturesMatch(expected, args.x_signature);
                lines.push(`Signature valid: ${valid}`);
            }
            else {
                lines.push("");
                lines.push("Note: Set MALIPO_SECRET_KEY to verify the signature live. The verification should match because Malipo signs the JSON payload with alphabetically sorted keys (Python json.dumps(payload, sort_keys=True) format).");
            }
        }
        else {
            lines.push("");
            lines.push("Note: No X-Signature provided. Production callbacks from Malipo include an HMAC-SHA256 signature in the X-Signature header.");
        }
        return {
            content: [{ type: "text", text: lines.join("\n") }]
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
        // This tool sends a real payment push and creates a real plan, so it must
        // never run against production.
        if (!config_js_1.isMockMode && !config_js_1.isSandbox) {
            return {
                content: [{ type: "text", text: `create_demo_shop only runs in sandbox (MALIPO_ENVIRONMENT is "${config_js_1.config.ENVIRONMENT}"). It initiates a real payment and creates a real installment plan.` }],
                isError: true,
            };
        }
        const results = [];
        const address = (0, security_js_1.resolveBaseUrl)(args.api_url);
        // 1. Get Token
        try {
            const token = await this.authService.ensureToken(address);
            results.push({
                step: "1. Authentication",
                action: "POST /accounts/request/token",
                insight: "Tokens should be stored and reused until they expire (usually 1 hour).",
                result: { access_token: (0, security_js_1.displayToken)(token) }
            });
        }
        catch (e) {
            results.push({ step: "Get Token", error: e.message });
        }
        // 2. Initiate Payment
        try {
            const paymentResult = await this.client.initiatePayment({
                customer_msisdn: "255700000000",
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
                    phone: "255700000000",
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
                insight: "Use this for Buy-Now-Pay-Later flows. The response includes the created customer, plan summary, and generated installment schedule.",
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
                        platform_guide: "This sequence demonstrates a full Malipo integration. AI agents should use these patterns to build checkout pages and payment handlers.",
                        grounding_trace: results,
                        next_steps: [
                            "Check 'malipo://docs/webhooks' to learn how to handle asynchronous status updates.",
                            "Use 'malipo://examples/node-express' for a production-ready boilerplate."
                        ]
                    }, null, 2)
                }]
        };
    }
    async run(transport) {
        await this.server.connect(transport);
        console.error("Malipo MCP Server running on stdio");
    }
}
exports.MalipoServer = MalipoServer;
