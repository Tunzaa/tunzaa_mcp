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
  x_signature: z.string().optional().describe("The X-Signature header value. HMAC-SHA256 of the JSON payload with alphabetically sorted keys (Python json.dumps(payload, sort_keys=True) format) using your API secret key."),
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

// --- Commerce (soko marketplace) ---

export const SearchProductsSchema = z.object({
  query: z.string().optional().describe("Free-text search over product names and descriptions. Omit or pass an empty string to list products."),
  limit: z.number().int().positive().max(100).optional().describe("Max number of products to return (default server-side)."),
  skip: z.number().int().min(0).optional().describe("Number of results to skip for pagination."),
});

export const GetProductSchema = z.object({
  product_id: z.string().optional().describe("The product's unique id (UUID)."),
  slug: z.string().optional().describe("The product's URL slug, as an alternative to product_id."),
}).refine(data => !!(data.product_id || data.slug), {
  message: "Provide either product_id or slug.",
});

export const CreateCartSchema = z.object({
  session_id: z.string().optional().describe("Optional guest session id. A cart is created or fetched for it; a random one is generated if omitted. Reuse the returned cart_id for subsequent calls."),
});

export const AddToCartSchema = z.object({
  cart_id: z.string().describe("The cart_id returned by create_cart."),
  product_id: z.string().describe("The product to add (from search_products / get_product)."),
  quantity: z.number().int().positive().default(1).describe("How many units to add."),
  sku: z.string().optional().describe("Optional product variant SKU."),
});

export const ViewCartSchema = z.object({
  cart_id: z.string().describe("The cart to inspect. Returns the cart contents and computed totals."),
});

export const ShippingAddressSchema = z.object({
  first_name: z.string().describe("Buyer first name."),
  last_name: z.string().describe("Buyer last name."),
  phone: z.string().describe("Contact phone number (international format without '+', e.g. 255700000000)."),
  address_line1: z.string().describe("Street address."),
  city: z.string().describe("City."),
  state_province: z.string().describe("State or province/region."),
  country: z.string().describe("ISO country code, e.g. TZ."),
  address_line2: z.string().optional().describe("Optional second address line."),
  postal_code: z.string().optional().describe("Optional postal/ZIP code."),
  email: z.string().optional().describe("Optional contact email."),
});

export const CreateOrderSchema = z.object({
  cart_id: z.string().describe("The cart to convert into an order. Does NOT charge the buyer; use pay_order for that."),
  shipping: ShippingAddressSchema.describe("Guest buyer shipping/contact details. A guest buyer account is provisioned from this."),
  notes: z.string().optional().describe("Optional order notes."),
});

export const PayOrderSchema = z.object({
  order_number: z.string().describe("The order to pay, from create_order."),
  customer_msisdn: z.string().describe("Payer phone number for the Mobile Money push (e.g. 255700000000)."),
});
