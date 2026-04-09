"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDemoShopSchema = exports.DeleteInstallmentPlanSchema = exports.EditInstallmentPlanSchema = exports.GetInstallmentPlanSchema = exports.ListInstallmentsSchema = exports.CreateInstallmentSchema = exports.HandleCallbackSchema = exports.GetPaymentStatusSchema = exports.InitiatePaymentSchema = exports.GetTokenSchema = void 0;
const zod_1 = require("zod");
exports.GetTokenSchema = zod_1.z.object({
    address: zod_1.z.string().optional(),
});
exports.InitiatePaymentSchema = zod_1.z.object({
    customer_msisdn: zod_1.z.string().describe("Customer phone number (e.g., 0744550667)"),
    amount: zod_1.z.string().describe("Amount to pay"),
    reference: zod_1.z.string().describe("Unique order reference"),
    address: zod_1.z.string().optional(),
});
exports.GetPaymentStatusSchema = zod_1.z.object({
    transactionID: zod_1.z.string().describe("Transaction ID returned from initiate_payment"),
    address: zod_1.z.string().optional(),
});
exports.HandleCallbackSchema = zod_1.z.object({
    transaction_id: zod_1.z.string(),
    status: zod_1.z.string(),
    reference_id: zod_1.z.string().optional(),
    amount: zod_1.z.string().optional(),
    payment_date: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().optional(),
});
exports.CreateInstallmentSchema = zod_1.z.object({
    customer: zod_1.z.object({
        first_name: zod_1.z.string(),
        last_name: zod_1.z.string(),
        phone: zod_1.z.string(),
        address: zod_1.z.string(),
    }),
    name: zod_1.z.string().describe("Plan name (e.g., 'Samsung S20')"),
    description: zod_1.z.string(),
    total_amount: zod_1.z.number(),
    payment_frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'custom']).describe("'daily', 'weekly', 'monthly', or 'custom'"),
    start_date: zod_1.z.string().describe("YYYY-MM-DD"),
    end_date: zod_1.z.string().describe("YYYY-MM-DD"),
    custom_interval: zod_1.z.number().optional().describe("Days between payments if frequency is 'custom'"),
    address: zod_1.z.string().optional(),
});
exports.ListInstallmentsSchema = zod_1.z.object({
    from: zod_1.z.number().default(0).describe("Pagination offset"),
    limit: zod_1.z.number().default(20).describe("Items per page"),
    address: zod_1.z.string().optional(),
});
exports.GetInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number(),
    address: zod_1.z.string().optional(),
});
exports.EditInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number(),
    updates: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).describe("Fields to update (customer, name, description, etc.)"),
    address: zod_1.z.string().optional(),
});
exports.DeleteInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number(),
    address: zod_1.z.string().optional(),
});
exports.CreateDemoShopSchema = zod_1.z.object({
    api_url: zod_1.z.string().optional().describe("Optional URL to use for API calls during simulation"),
});
