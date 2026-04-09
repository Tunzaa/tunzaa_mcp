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
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export const TOOLS: Tool[] = [
    {
        name: "get_token",
        description: "Retrieve a Tunzaa access token. Refreshes internal token automatically. Use this to verify your API credentials and see the internal token structure.",
        inputSchema: zodToJsonSchema(GetTokenSchema) as any,
    },
    {
        name: "initiate_payment",
        description: "Initiate a payment request (M-Pesa, etc.) via Tunzaa. Call this to inspect the response structure needed to implement mobile money flows in your local code.",
        inputSchema: zodToJsonSchema(InitiatePaymentSchema) as any,
    },
    {
        name: "get_payment_status",
        description: "Check the status of a payment transaction. Helpful for understanding the various status states (COMPLETED, PENDING, FAILED) for your application logic.",
        inputSchema: zodToJsonSchema(GetPaymentStatusSchema) as any,
    },
    {
        name: "handle_callback",
        description: "Simulate or handle the callback payload sent by Tunzaa to your webhook. Essential for grounding your webhook integration code with real payload examples.",
        inputSchema: zodToJsonSchema(HandleCallbackSchema) as any,
    },
    {
        name: "create_installment",
        description: "Create a new installment plan. Use this to understand the complex object structure required for installment-based payments.",
        inputSchema: zodToJsonSchema(CreateInstallmentSchema) as any,
    },
    {
        name: "list_installments",
        description: "List existing installment plans. Use this to see how pagination and plan summaries are returned by the Tunzaa API.",
        inputSchema: zodToJsonSchema(ListInstallmentsSchema) as any,
    },
    {
        name: "get_installment_plan",
        description: "Get details of a specific installment plan. Use this to see the precise fields returned for a plan (status, schedules, etc.).",
        inputSchema: zodToJsonSchema(GetInstallmentPlanSchema) as any,
    },
    {
        name: "edit_installment_plan",
        description: "Update an existing installment plan. Use this to understand which fields are mutable via the Tunzaa API.",
        inputSchema: zodToJsonSchema(EditInstallmentPlanSchema) as any,
    },
    {
        name: "delete_installment_plan",
        description: "Cancel/Delete an existing installment plan. Use this to verify the cancellation response structure.",
        inputSchema: zodToJsonSchema(DeleteInstallmentPlanSchema) as any,
    },
    {
        name: "create_demo_shop",
        description: "The ultimate grounding tool. Executes a full sequence of Tunzaa API calls (Token -> Payment -> Installments). Use this to see a 'live trace' of the API, allowing you to generate perfect integration code.",
        inputSchema: zodToJsonSchema(CreateDemoShopSchema) as any,
    }
];
