"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOLS = void 0;
const schemas_js_1 = require("./schemas.js");
const zod_to_json_schema_1 = require("zod-to-json-schema");
exports.TOOLS = [
    {
        name: "get_token",
        description: "Retrieve a Malipo API access token. Refreshes internal token automatically. Use this to verify your API credentials and see the internal token structure.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetTokenSchema),
    },
    {
        name: "initiate_payment",
        description: "Initiate a payment request (M-Pesa, etc.) via Malipo API. Call this to inspect the response structure needed to implement mobile money flows in your local code.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.InitiatePaymentSchema),
    },
    {
        name: "get_payment_status",
        description: "Check the status of a payment transaction. Helpful for understanding the various status states (COMPLETED, PENDING, FAILED) for your application logic.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetPaymentStatusSchema),
    },
    {
        name: "handle_callback",
        description: "Simulate or handle the callback payload sent by Malipo to your webhook. Essential for grounding your webhook integration code with real payload examples.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.HandleCallbackSchema),
    },
    {
        name: "create_installment",
        description: "Create a new installment plan. Use this to understand the complex object structure required for installment-based payments.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.CreateInstallmentSchema),
    },
    {
        name: "list_installments",
        description: "List existing installment plans. Use this to see how pagination and plan summaries are returned by the Malipo API.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.ListInstallmentsSchema),
    },
    {
        name: "get_installment_plan",
        description: "Get details of a specific installment plan. Use this to see the precise fields returned for a plan (status, schedules, etc.).",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetInstallmentPlanSchema),
    },
    {
        name: "edit_installment_plan",
        description: "Update an existing installment plan. Use this to understand which fields are mutable via the Malipo API.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.EditInstallmentPlanSchema),
    },
    {
        name: "delete_installment_plan",
        description: "Cancel/Delete an existing installment plan. Use this to verify the cancellation response structure.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.DeleteInstallmentPlanSchema),
    },
    {
        name: "create_demo_shop",
        description: "The ultimate grounding tool. Executes a full sequence of Malipo API calls (Token -> Payment -> Installments). Use this to see a 'live trace' of the API, allowing you to generate perfect integration code.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.CreateDemoShopSchema),
    },
    {
        name: "search_products",
        description: "Search or list products in the Tunzaa soko (marketplace) for the configured tenant. Use this to discover products available to purchase. Read-only.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.SearchProductsSchema),
    },
    {
        name: "get_product",
        description: "Get full details of a single soko product by id or slug (price, description, vendor, store). Read-only.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.GetProductSchema),
    },
    {
        name: "create_cart",
        description: "Create (or fetch) a guest shopping cart and return its cart_id. Reuse that cart_id to add items and create an order. Reversible; charges nothing.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.CreateCartSchema),
    },
    {
        name: "add_to_cart",
        description: "Add a product to a guest cart by cart_id and product_id. Returns the updated cart. Reversible; charges nothing.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.AddToCartSchema),
    },
    {
        name: "view_cart",
        description: "View a cart's items and computed totals (subtotal, discount, tax, total). Read-only.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.ViewCartSchema),
    },
    {
        name: "create_order",
        description: "Convert a cart into a pending guest order using the buyer's shipping/contact details. Returns an order_number and totals. This does NOT charge the buyer — it only creates a pending order. Call pay_order, with human approval, to collect payment.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.CreateOrderSchema),
    },
    {
        name: "pay_order",
        description: "CHARGES THE BUYER. Initiates a real Mobile Money payment push for a pending order via the Tunzaa payment gateway. This moves money and must only be called after a human has explicitly approved paying this specific order. Confirm the order_number and amount (via get_order) before calling.",
        inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(schemas_js_1.PayOrderSchema),
    }
];
