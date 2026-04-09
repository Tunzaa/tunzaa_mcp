import { z } from "zod";

export const GetTokenSchema = z.object({
  address: z.string().optional(),
});

export const InitiatePaymentSchema = z.object({
  customer_msisdn: z.string().describe("Customer phone number (e.g., 0744550667)"),
  amount: z.string().describe("Amount to pay"),
  reference: z.string().describe("Unique order reference"),
  address: z.string().optional(),
});

export const GetPaymentStatusSchema = z.object({
  transactionID: z.string().describe("Transaction ID returned from initiate_payment"),
  address: z.string().optional(),
});

export const HandleCallbackSchema = z.object({
  transaction_id: z.string(),
  status: z.string(),
  reference_id: z.string().optional(),
  amount: z.string().optional(),
  payment_date: z.string().optional(),
  timestamp: z.string().optional(),
});

export const CreateInstallmentSchema = z.object({
  customer: z.object({
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  name: z.string().describe("Plan name (e.g., 'Samsung S20')"),
  description: z.string(),
  total_amount: z.number(),
  payment_frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']).describe("'daily', 'weekly', 'monthly', or 'custom'"),
  start_date: z.string().describe("YYYY-MM-DD"),
  end_date: z.string().describe("YYYY-MM-DD"),
  custom_interval: z.number().optional().describe("Days between payments if frequency is 'custom'"),
  address: z.string().optional(),
});

export const ListInstallmentsSchema = z.object({
  from: z.number().default(0).describe("Pagination offset"),
  limit: z.number().default(20).describe("Items per page"),
  address: z.string().optional(),
});

export const GetInstallmentPlanSchema = z.object({
  plan_id: z.number(),
  address: z.string().optional(),
});

export const EditInstallmentPlanSchema = z.object({
  plan_id: z.number(),
  updates: z.record(z.string(), z.any()).describe("Fields to update (customer, name, description, etc.)"),
  address: z.string().optional(),
});

export const DeleteInstallmentPlanSchema = z.object({
  plan_id: z.number(),
  address: z.string().optional(),
});

export const CreateDemoShopSchema = z.object({
  api_url: z.string().optional().describe("Optional URL to use for API calls during simulation"),
});
