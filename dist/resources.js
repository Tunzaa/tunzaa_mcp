"use strict";
/**
 * Community Documentation & Integration Patterns
 * These resources are exposed via MCP to provide high-fidelity grounding
 * for AI agents building on top of the Tunzaa ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESOURCES = void 0;
exports.RESOURCES = [
    {
        uri: "tunzaa://docs/authentication",
        name: "Authentication & Token Management",
        description: "Best practices for managing Tunzaa Bearer tokens and environment headers.",
        mimeType: "text/markdown",
        text: `# Tunzaa Authentication Guide

To interact with Tunzaa APIs, you must first obtain an access token.

## 1. Requesting a Token
**Endpoint**: \`POST /accounts/request/token\`

### Payload
\`\`\`json
{
  "api_key": "YOUR_API_KEY",
  "secret_key": "YOUR_SECRET_KEY"
}
\`\`\`

### Response
\`\`\`json
{
  "access_token": "eyJhbG...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
\`\`\`

## 2. Using the Token
All subsequent requests must include the token in the \`Authorization\` header and specify the environment.

### Required Headers
- \`Authorization: Bearer <access_token>\`
- \`X-Environment: sandbox\` (or \`production\`)
- \`Content-Type: application/json\`

## 3. Best Practices
- **Caching**: Tokens usually last 1 hour. Store them in memory/redis and refresh 5 minutes before expiry.
- **Security**: Never expose your \`secret_key\` on the frontend. Auth should always happen server-side.`
    },
    {
        uri: "tunzaa://docs/webhooks",
        name: "Webhook Integration & Security",
        description: "How to securely handle payment callbacks from Tunzaa.",
        mimeType: "text/markdown",
        text: `# Tunzaa Webhooks Guide

Webhooks are the recommended way to track payment completion. Tunzaa sends a \`POST\` request to your configured callback URL when a transaction reaches a final state.

## 1. Webhook Payload Structure
\`\`\`json
{
  "transaction_id": "TZ20240101XYZ",
  "status": "COMPLETED",
  "reference_id": "ORDER-123",
  "amount": "5000.00",
  "payment_date": "2024-01-01 10:00:00",
  "timestamp": "1704096000"
}
\`\`\`

## 2. Implementation Strategy
1. **Endpoint**: Create a public \`POST\` endpoint (e.g., \`/api/tunzaa/callback\`).
2. **Idempotency**: Always check your database to see if the \`transaction_id\` has already been processed to avoid duplicate fulfillment.
3. **Response**: Return a \`200 OK\` quickly. If you fail to respond, Tunzaa may retry the callback.

## 3. Security (Signature Verification)
Recommended: Verify the \`X-Tunzaa-Signature\` if provided, or whitelist Tunzaa's callback IP addresses.`
    },
    {
        uri: "tunzaa://examples/node-express",
        name: "Node.js Express Integration snippet",
        description: "A golden example of a Tunzaa payment integration using Express.js.",
        mimeType: "text/javascript",
        text: `// Tunzaa Payment Integration (Express.js) - Golden Example
import express from 'express';
import axios from 'axios';

const router = express.Router();
const TUNZAA_BASE_URL = 'https://api.tunzaa.com/v1';

// 1. Checkout Endpoint
router.post('/checkout', async (req, res) => {
  try {
    const { amount, phone, orderId } = req.body;

    // Get Token (Implement caching in production!)
    const authRest = await axios.post(\`\${TUNZAA_BASE_URL}/accounts/request/token\`, {
      api_key: process.env.TUNZAA_API_KEY,
      secret_key: process.env.TUNZAA_SECRET_KEY
    });

    const token = authRest.data.access_token;

    // Initiate Payment
    const paymentResp = await axios.post(\`\${TUNZAA_BASE_URL}/payments/initiate-payment\`, {
      customer_msisdn: phone,
      amount: amount,
      reference: orderId
    }, {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'X-Environment': 'sandbox'
      }
    });

    res.json({ success: true, transactionId: paymentResp.data.transactionID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook Handler
router.post('/webhook', async (req, res) => {
  const { transaction_id, status, reference_id } = req.body;
  
  console.log(\`Received Tunzaa payment [\${status}] for order \${reference_id}\`);
  
  if (status === 'COMPLETED') {
    // TODO: Update order in DB
    // await db.orders.update({ id: reference_id }, { status: 'PAID' });
  }
  
  res.sendStatus(200);
});

export default router;`
    }
];
