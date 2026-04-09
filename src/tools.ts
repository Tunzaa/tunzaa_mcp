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
        description: "Retrieve a Tunzaa access token. Refreshes internal token automatically.",
        inputSchema: zodToJsonSchema(GetTokenSchema) as any,
    },
    {
        name: "initiate_payment",
        description: "Initiate a payment request (M-Pesa, etc.) via Tunzaa.",
        inputSchema: zodToJsonSchema(InitiatePaymentSchema) as any,
    },
    {
        name: "get_payment_status",
        description: "Check the status of a payment transaction using its transaction ID.",
        inputSchema: zodToJsonSchema(GetPaymentStatusSchema) as any,
    },
    {
        name: "handle_callback",
        description: "Simulate or handle the callback payload sent by Tunzaa to your webhook.",
        inputSchema: zodToJsonSchema(HandleCallbackSchema) as any,
    },
    {
        name: "create_installment",
        description: "Create a new installment plan for a customer.",
        inputSchema: zodToJsonSchema(CreateInstallmentSchema) as any,
    },
    {
        name: "list_installments",
        description: "List existing installment plans with optional pagination.",
        inputSchema: zodToJsonSchema(ListInstallmentsSchema) as any,
    },
    {
        name: "get_installment_plan",
        description: "Get details and status of a specific installment plan.",
        inputSchema: zodToJsonSchema(GetInstallmentPlanSchema) as any,
    },
    {
        name: "edit_installment_plan",
        description: "Update an existing installment plan's details.",
        inputSchema: zodToJsonSchema(EditInstallmentPlanSchema) as any,
    },
    {
        name: "delete_installment_plan",
        description: "Cancel/Delete an existing installment plan.",
        inputSchema: zodToJsonSchema(DeleteInstallmentPlanSchema) as any,
    },
    {
        name: "create_demo_shop",
        description: "Create a demo shop with full Tunzaa integration simulation. Runs a sequence of API calls.",
        inputSchema: zodToJsonSchema(CreateDemoShopSchema) as any,
    }
];
