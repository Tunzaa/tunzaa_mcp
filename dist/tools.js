"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOLS = void 0;
const schemas_js_1 = require("./schemas.js");
const zod_to_json_schema_1 = require("zod-to-json-schema");
exports.TOOLS = [
    {
        name: "get_token",
        description: "Retrieve a Tunzaa access token. Refreshes internal token automatically. Use this to verify your API credentials and see the internal token structure.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetTokenSchema),
    },
    {
        name: "initiate_payment",
        description: "Initiate a payment request (M-Pesa, etc.) via Tunzaa. Call this to inspect the response structure needed to implement mobile money flows in your local code.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.InitiatePaymentSchema),
    },
    {
        name: "get_payment_status",
        description: "Check the status of a payment transaction. Helpful for understanding the various status states (COMPLETED, PENDING, FAILED) for your application logic.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetPaymentStatusSchema),
    },
    {
        name: "handle_callback",
        description: "Simulate or handle the callback payload sent by Tunzaa to your webhook. Essential for grounding your webhook integration code with real payload examples.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.HandleCallbackSchema),
    },
    {
        name: "create_installment",
        description: "Create a new installment plan. Use this to understand the complex object structure required for installment-based payments.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.CreateInstallmentSchema),
    },
    {
        name: "list_installments",
        description: "List existing installment plans. Use this to see how pagination and plan summaries are returned by the Tunzaa API.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.ListInstallmentsSchema),
    },
    {
        name: "get_installment_plan",
        description: "Get details of a specific installment plan. Use this to see the precise fields returned for a plan (status, schedules, etc.).",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetInstallmentPlanSchema),
    },
    {
        name: "edit_installment_plan",
        description: "Update an existing installment plan. Use this to understand which fields are mutable via the Tunzaa API.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.EditInstallmentPlanSchema),
    },
    {
        name: "delete_installment_plan",
        description: "Cancel/Delete an existing installment plan. Use this to verify the cancellation response structure.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.DeleteInstallmentPlanSchema),
    },
    {
        name: "create_demo_shop",
        description: "The ultimate grounding tool. Executes a full sequence of Tunzaa API calls (Token -> Payment -> Installments). Use this to see a 'live trace' of the API, allowing you to generate perfect integration code.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.CreateDemoShopSchema),
    }
];
