import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { createHmac } from "crypto";
import { AuthService } from "./services/auth.service.js";
import { ITunzaaClient, getTunzaaClient } from "./services/tunzaa.client.js";
import { TOOLS } from "./tools.js";
import { RESOURCES } from "./resources.js";
import { config, isMockMode } from "./config.js";
import {
    GetTokenSchema,
    InitiatePaymentSchema,
    GetPaymentStatusSchema,
    HandleCallbackSchema,
    CreateInstallmentSchema,
    ListInstallmentsSchema,
    GetInstallmentPlanSchema,
    EditInstallmentPlanSchema,
    DeleteInstallmentPlanSchema,
    CreateDemoShopSchema
} from "./schemas.js";

export class MalipoServer {
    private server: Server;
    private authService: AuthService;
    private client: ITunzaaClient;

    constructor() {
        this.server = new Server(
            {
                name: "malipo-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.authService = new AuthService();
        this.client = getTunzaaClient(this.authService);

        this.setupHandlers();
        this.setupErrorHandling();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: TOOLS,
        }));

        this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources: RESOURCES.map(r => ({
                uri: r.uri,
                name: r.name,
                mimeType: r.mimeType,
                description: r.description
            })),
        }));

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const resource = RESOURCES.find((r) => r.uri === request.params.uri);
            if (!resource) {
                throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
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

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case "get_token":
                        return await this.handleGetToken(GetTokenSchema.parse(args));
                    case "initiate_payment":
                        return await this.handleInitiatePayment(InitiatePaymentSchema.parse(args));
                    case "get_payment_status":
                        return await this.handleGetPaymentStatus(GetPaymentStatusSchema.parse(args));
                    case "handle_callback":
                        return await this.handleCallback(HandleCallbackSchema.parse(args));
                    case "create_installment":
                        return await this.handleCreateInstallment(CreateInstallmentSchema.parse(args));
                    case "list_installments":
                        return await this.handleListInstallments(ListInstallmentsSchema.parse(args));
                    case "get_installment_plan":
                        return await this.handleGetInstallmentPlan(GetInstallmentPlanSchema.parse(args));
                    case "edit_installment_plan":
                        return await this.handleEditInstallmentPlan(EditInstallmentPlanSchema.parse(args));
                    case "delete_installment_plan":
                        return await this.handleDeleteInstallmentPlan(DeleteInstallmentPlanSchema.parse(args));
                    case "create_demo_shop":
                        return await this.handleCreateDemoShop(CreateDemoShopSchema.parse(args));
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            } catch (error: any) {
                return this.formatError(error);
            }
        });
    }

    private setupErrorHandling() {
        this.server.onerror = (error) => console.error("[MCP Error]", error);

        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private formatError(error: any) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message;
            const errorDetails = JSON.stringify(error.response?.data || {});
            return {
                content: [{ type: "text", text: `API Error: ${errorMessage} (Status: ${error.response?.status})\nDetails: ${errorDetails}` }],
                isError: true,
            };
        }
        if (error instanceof McpError) {
            throw error;
        }
        return {
            content: [{ type: "text", text: `Internal Error: ${error.message}` }],
            isError: true,
        };
    }

    // --- Handlers ---

    private async handleGetToken(args: any) {
        const token = await this.authService.ensureToken(args.address);
        return {
            content: [{ type: "text", text: JSON.stringify({ access_token: token }, null, 2) }],
        };
    }

    private async handleInitiatePayment(args: any) {
        const result = await this.client.initiatePayment(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private async handleGetPaymentStatus(args: any) {
        const result = await this.client.getPaymentStatus(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private canonicalJson(obj: unknown): string {
        if (obj === null || typeof obj !== "object") {
            return JSON.stringify(obj);
        }
        if (Array.isArray(obj)) {
            return "[" + obj.map(item => this.canonicalJson(item)).join(",") + "]";
        }
        const sortedObj: Record<string, unknown> = {};
        for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
            sortedObj[key] = (obj as Record<string, unknown>)[key];
        }
        const pairs = Object.entries(sortedObj).map(
            ([key, value]) => `${JSON.stringify(key)}: ${this.canonicalJson(value)}`
        );
        return "{" + pairs.join(", ") + "}";
    }

    private async handleCallback(args: any) {
        const payload = {
            transaction_id: args.transaction_id,
            status: args.status,
            reference_id: args.reference_id,
            amount: args.amount,
            payment_date: args.payment_date,
            timestamp: args.timestamp,
        };

        // Drop undefined fields so the canonical JSON matches Malipo's payload.
        const cleanPayload: Record<string, string> = {};
        for (const [key, value] of Object.entries(payload)) {
            if (value !== undefined) cleanPayload[key] = value as string;
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

            if (config.SECRET_KEY) {
                const expected = createHmac("sha256", config.SECRET_KEY)
                    .update(canonicalBody)
                    .digest("hex");
                const valid = expected === args.x_signature;
                lines.push(`Expected signature: ${expected}`);
                lines.push(`Signature valid: ${valid}`);
            } else {
                lines.push("");
                lines.push("Note: Set MALIPO_SECRET_KEY to verify the signature live. The verification should match because Malipo signs the JSON payload with alphabetically sorted keys (Python json.dumps(payload, sort_keys=True) format).");
            }
        } else {
            lines.push("");
            lines.push("Note: No X-Signature provided. Production callbacks from Malipo include an HMAC-SHA256 signature in the X-Signature header.");
        }

        return {
            content: [{ type: "text", text: lines.join("\n") }]
        };
    }

    private async handleCreateInstallment(args: any) {
        const result = await this.client.createInstallment(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private async handleListInstallments(args: any) {
        const result = await this.client.listInstallments(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private async handleGetInstallmentPlan(args: any) {
        const result = await this.client.getInstallmentPlan(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private async handleEditInstallmentPlan(args: any) {
        const result = await this.client.editInstallmentPlan(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private async handleDeleteInstallmentPlan(args: any) {
        const result = await this.client.deleteInstallmentPlan(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    private async handleCreateDemoShop(args: any) {
        const results = [];
        const address = args.api_url || config.API_BASE_URL;

        // 1. Get Token
        try {
            const token = await this.authService.ensureToken(address);
            results.push({ 
                step: "1. Authentication", 
                action: "POST /accounts/request/token",
                insight: "Tokens should be stored and reused until they expire (usually 1 hour).",
                result: { access_token: token } 
            });
        } catch (e: any) {
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
        } catch (e: any) {
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
        } catch (e: any) {
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

    async run(transport: any) {
        await this.server.connect(transport);
        console.error("Malipo MCP Server running on stdio");
    }
}
