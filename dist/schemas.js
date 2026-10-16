"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayOrderSchema = exports.CreateOrderSchema = exports.ShippingAddressSchema = exports.ViewCartSchema = exports.AddToCartSchema = exports.CreateCartSchema = exports.GetProductSchema = exports.SearchProductsSchema = exports.CreateDemoShopSchema = exports.DeleteInstallmentPlanSchema = exports.EditInstallmentPlanSchema = exports.GetInstallmentPlanSchema = exports.ListInstallmentsSchema = exports.CreateInstallmentSchema = exports.HandleCallbackSchema = exports.GetPaymentStatusSchema = exports.InitiatePaymentSchema = exports.GetTokenSchema = void 0;
const zod_1 = require("zod");
exports.GetTokenSchema = zod_1.z.object({
    address: zod_1.z.string().optional().describe("Optional override for the Malipo API base URL."),
});
exports.InitiatePaymentSchema = zod_1.z.object({
    customer_msisdn: zod_1.z.string().describe("Customer phone number in international format without '+' (e.g., 255700000000). Essential for Mobile Money push."),
    amount: zod_1.z.string().describe("Transaction amount as a string to avoid precision issues (e.g., '5000')."),
    reference: zod_1.z.string().describe("Unique order reference from your system. Used to match callbacks."),
    sandbox_scenario: zod_1.z.enum(["success", "failure"]).optional().describe("In sandbox mode, forces the outcome of the payment push. Maps to the X-Sandbox-Scenario header."),
    address: zod_1.z.string().optional().describe("Optional override for API base URL."),
});
exports.GetPaymentStatusSchema = zod_1.z.object({
    transactionID: zod_1.z.string().describe("The 'transactionID' previously returned by 'initiate_payment'."),
    address: zod_1.z.string().optional(),
});
exports.HandleCallbackSchema = zod_1.z.object({
    transaction_id: zod_1.z.string().describe("The unique Malipo transaction ID sent in the webhook."),
    status: zod_1.z.string().describe("The final status of the payment (e.g., 'COMPLETED', 'FAILED', 'CANCELLED')."),
    reference_id: zod_1.z.string().optional().describe("Your system's unique order reference."),
    amount: zod_1.z.string().optional().describe("The amount confirmed by the provider as a decimal string (e.g., '1500.00')."),
    payment_date: zod_1.z.string().optional().describe("The date and time the payment was completed, e.g. '2024-11-25 14:30:45'."),
    timestamp: zod_1.z.string().optional().describe("The event datetime as a string, e.g. '2024-11-25 16:45:10'."),
    x_signature: zod_1.z.string().optional().describe("The X-Signature header value. HMAC-SHA256 of the JSON payload with alphabetically sorted keys (Python json.dumps(payload, sort_keys=True) format) using your API secret key."),
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
    from: zod_1.z.number().optional().describe("Starting index for pagination (sent as query parameter)."),
    limit: zod_1.z.number().optional().describe("Number of plans to return per page (sent as query parameter)."),
    address: zod_1.z.string().optional(),
});
exports.GetInstallmentPlanSchema = zod_1.z.object({
    plan_id: zod_1.z.number().describe("The unique numeric ID of the installment plan."),
    include_payments: zod_1.z.boolean().optional().describe("Append ?include_payments=true to also receive completed payment history and progress totals."),
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
    api_url: zod_1.z.string().optional().describe("Optional URL to simulate the Malipo environment for grounding."),
});
// --- Commerce (soko marketplace) ---
exports.SearchProductsSchema = zod_1.z.object({
    query: zod_1.z.string().optional().describe("Free-text search over product names and descriptions. Omit or pass an empty string to list products."),
    limit: zod_1.z.number().int().positive().max(100).optional().describe("Max number of products to return (default server-side)."),
    skip: zod_1.z.number().int().min(0).optional().describe("Number of results to skip for pagination."),
});
exports.GetProductSchema = zod_1.z.object({
    product_id: zod_1.z.string().optional().describe("The product's unique id (UUID)."),
    slug: zod_1.z.string().optional().describe("The product's URL slug, as an alternative to product_id."),
}).refine(data => !!(data.product_id || data.slug), {
    message: "Provide either product_id or slug.",
});
exports.CreateCartSchema = zod_1.z.object({
    session_id: zod_1.z.string().optional().describe("Optional guest session id. A cart is created or fetched for it; a random one is generated if omitted. Reuse the returned cart_id for subsequent calls."),
});
exports.AddToCartSchema = zod_1.z.object({
    cart_id: zod_1.z.string().describe("The cart_id returned by create_cart."),
    product_id: zod_1.z.string().describe("The product to add (from search_products / get_product)."),
    quantity: zod_1.z.number().int().positive().default(1).describe("How many units to add."),
    sku: zod_1.z.string().optional().describe("Optional product variant SKU."),
});
exports.ViewCartSchema = zod_1.z.object({
    cart_id: zod_1.z.string().describe("The cart to inspect. Returns the cart contents and computed totals."),
});
exports.ShippingAddressSchema = zod_1.z.object({
    first_name: zod_1.z.string().describe("Buyer first name."),
    last_name: zod_1.z.string().describe("Buyer last name."),
    phone: zod_1.z.string().describe("Contact phone number (international format without '+', e.g. 255700000000)."),
    address_line1: zod_1.z.string().describe("Street address."),
    city: zod_1.z.string().describe("City."),
    state_province: zod_1.z.string().describe("State or province/region."),
    country: zod_1.z.string().describe("ISO country code, e.g. TZ."),
    address_line2: zod_1.z.string().optional().describe("Optional second address line."),
    postal_code: zod_1.z.string().optional().describe("Optional postal/ZIP code."),
    email: zod_1.z.string().optional().describe("Optional contact email."),
});
exports.CreateOrderSchema = zod_1.z.object({
    cart_id: zod_1.z.string().describe("The cart to convert into an order. Does NOT charge the buyer; use pay_order for that."),
    shipping: exports.ShippingAddressSchema.describe("Guest buyer shipping/contact details. A guest buyer account is provisioned from this."),
    notes: zod_1.z.string().optional().describe("Optional order notes."),
});
exports.PayOrderSchema = zod_1.z.object({
    order_number: zod_1.z.string().describe("The order to pay, from create_order."),
    customer_msisdn: zod_1.z.string().describe("Payer phone number for the Mobile Money push (e.g. 255700000000)."),
});
