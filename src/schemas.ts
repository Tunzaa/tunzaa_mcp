import { z } from "zod";

export const GetTokenSchema = z.object({
  address: z.string().optional().describe("Optional override for the Malipo API base URL."),
});

export const InitiatePaymentSchema = z.object({
  customer_msisdn: z.string().describe("Customer phone number in international format without '+' (e.g., 255700000000). Essential for Mobile Money push."),
  amount: z.string().describe("Transaction amount as a string to avoid precision issues (e.g., '5000')."),
  reference: z.string().describe("Unique order reference from your system. Used to match callbacks."),
  sandbox_scenario: z.enum(["success", "failure"]).optional().describe("In sandbox mode, forces the outcome of the payment push. Maps to the X-Sandbox-Scenario header."),
  address: z.string().optional().describe("Optional override for API base URL."),
});

export const GetPaymentStatusSchema = z.object({
  transactionID: z.string().describe("The 'transactionID' previously returned by 'initiate_payment'."),
  address: z.string().optional(),
});

export const HandleCallbackSchema = z.object({
  transaction_id: z.string().describe("The unique Malipo transaction ID sent in the webhook."),
  status: z.string().describe("The final status of the payment (e.g., 'COMPLETED', 'FAILED', 'CANCELLED')."),
  reference_id: z.string().optional().describe("Your system's unique order reference."),
  amount: z.string().optional().describe("The amount confirmed by the provider as a decimal string (e.g., '1500.00')."),
  payment_date: z.string().optional().describe("The date and time the payment was completed, e.g. '2024-11-25 14:30:45'."),
  timestamp: z.string().optional().describe("The event datetime as a string, e.g. '2024-11-25 16:45:10'."),
  x_signature: z.string().optional().describe("The X-Signature header value. HMAC-SHA256 of the raw payload using your API secret key."),
});

export const CreateInstallmentSchema = z.object({
  customer: z.object({
    first_name: z.string().describe("Customer's official first name."),
    last_name: z.string().describe("Customer's official last name."),
    phone: z.string().describe("Primary contact phone number for the installment plan."),
    address: z.string().describe("Customer's physical or billing address."),
  }),
  name: z.string().describe("The name of the item or plan (e.g., 'Samsung S24 Ultra - 12 Month Plan')."),
  description: z.string().describe("Brief description of the product or service being financed."),
  total_amount: z.number().describe("The total price of the item to be paid in installments."),
  payment_frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']).describe("How often the customer will make payments."),
  start_date: z.string().describe("The date of the first installment payment (YYYY-MM-DD)."),
  end_date: z.string().describe("The expected completion date for all payments (YYYY-MM-DD)."),
  custom_interval: z.number().optional().describe("Number of days between installments if frequency is 'custom'."),
  address: z.string().optional(),
});

export const ListInstallmentsSchema = z.object({
  from: z.number().optional().describe("Starting index for pagination (sent as query parameter)."),
  limit: z.number().optional().describe("Number of plans to return per page (sent as query parameter)."),
  address: z.string().optional(),
});

export const GetInstallmentPlanSchema = z.object({
  plan_id: z.number().describe("The unique numeric ID of the installment plan."),
  include_payments: z.boolean().optional().describe("Append ?include_payments=true to also receive completed payment history and progress totals."),
  address: z.string().optional(),
});

export const EditInstallmentPlanSchema = z.object({
  plan_id: z.number().describe("The numeric ID of the plan to modify."),
  updates: z.record(z.string(), z.any()).describe("A map of fields to update (e.g., {'description': 'New description'})."),
  address: z.string().optional(),
});

export const DeleteInstallmentPlanSchema = z.object({
  plan_id: z.number().describe("The numeric ID of the plan to cancel/delete."),
  address: z.string().optional(),
});

export const CreateDemoShopSchema = z.object({
  api_url: z.string().optional().describe("Optional URL to simulate the Malipo environment for grounding."),
});
