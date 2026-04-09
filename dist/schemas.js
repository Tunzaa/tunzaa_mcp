"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDemoShopSchema = exports.DeleteInstallmentPlanSchema = exports.EditInstallmentPlanSchema = exports.GetInstallmentPlanSchema = exports.ListInstallmentsSchema = exports.CreateInstallmentSchema = exports.HandleCallbackSchema = exports.GetPaymentStatusSchema = exports.InitiatePaymentSchema = exports.GetTokenSchema = void 0;
const zod_1 = require("zod");
exports.GetTokenSchema = zod_1.z.object({
    address: zod_1.z.string().optional().describe("Optional override for the Tunzaa API base URL."),
});
exports.InitiatePaymentSchema = zod_1.z.object({
    customer_msisdn: zod_1.z.string().describe("Customer phone number in local format (e.g., 0744550667). Essential for Mobile Money push."),
    amount: zod_1.z.string().describe("Transaction amount as a string to avoid precision issues (e.g., '5000')."),
    reference: zod_1.z.string().describe("Unique order reference from your system. Used to match callbacks."),
    address: zod_1.z.string().optional().describe("Optional override for API base URL."),
});
exports.GetPaymentStatusSchema = zod_1.z.object({
    transactionID: zod_1.z.string().describe("The 'transactionID' previously returned by 'initiate_payment'."),
    address: zod_1.z.string().optional(),
});
exports.HandleCallbackSchema = zod_1.z.object({
    transaction_id: zod_1.z.string().describe("The unique Tunzaa transaction ID sent in the webhook."),
    status: zod_1.z.string().describe("The final status of the payment (e.g., 'COMPLETED', 'FAILED', 'CANCELLED')."),
    reference_id: zod_1.z.string().optional().describe("Your system's unique order reference."),
    amount: zod_1.z.string().optional().describe("The amount confirmed by the provider."),
    payment_date: zod_1.z.string().optional().describe("The date the payment was completed."),
    timestamp: zod_1.z.string().optional().describe("UNIX timestamp of the event."),
});
exports.CreateInstallmentSchema = zod_1.z.object({
    customer: zod_1.z.object({
        first_name: zod_1.z.string().describe("Customer's official first name."),
        last_name: zod_1.z.string().describe("Customer's official last name."),
        phone: zod_1.z.string().describe("Primary contact phone number for the installment plan."),
        address: zod_1.z.string().describe("Customer's physical or billing address."),
    }),
    name: zod_1.z.string().describe("The name of the item or plan (e.g., 'Samsung S24 Ultra - 12 Month Plan')."),
    description: zod_1.z.string().describe("Brief description of the product or service being financed."),
    total_amount: zod_1.z.number().describe("The total price of the item to be paid in installments."),
    payment_frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'custom']).describe("How often the customer will make payments."),
    start_date: zod_1.z.string().describe("The date of the first installment payment (YYYY-MM-DD)."),
    end_date: zod_1.z.string().describe("The expected completion date for all payments (YYYY-MM-DD)."),
    custom_interval: zod_1.z.number().optional().describe("Number of days between installments if frequency is 'custom'."),
    address: zod_1.z.string().optional(),
});
exports.ListInstallmentsSchema = zod_1.z.object({
    from: zod_1.z.number().default(0).describe("Starting index for pagination."),
    limit: zod_1.z.number().default(20).describe("Number of plans to return per page."),
    address: zod_1.z.string().optional(),
});
exports.GetInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number().describe("The unique numeric ID of the installment plan."),
    address: zod_1.z.string().optional(),
});
exports.EditInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number().describe("The numeric ID of the plan to modify."),
    updates: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).describe("A map of fields to update (e.g., {'description': 'New description'})."),
    address: zod_1.z.string().optional(),
});
exports.DeleteInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number().describe("The numeric ID of the plan to cancel/delete."),
    address: zod_1.z.string().optional(),
});
exports.CreateDemoShopSchema = zod_1.z.object({
    api_url: zod_1.z.string().optional().describe("Optional URL to simulate the Tunzaa environment for grounding."),
});
