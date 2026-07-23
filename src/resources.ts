/**
 * Community Documentation & Integration Patterns
 * These resources are exposed via MCP to provide high-fidelity grounding
 * for AI agents building on top of the Malipo by Tunzaa ecosystem.
 */

export const RESOURCES = [
    {
        uri: "malipo://docs/authentication",
        name: "Authentication & Token Management",
        description: "Best practices for managing Malipo Bearer tokens and environment headers.",
        mimeType: "text/markdown",
        text: `# Malipo Authentication Guide

To interact with Malipo APIs, you must first obtain an access token.

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
        uri: "malipo://docs/webhooks",
        name: "Webhook Integration & Security",
        description: "How to securely handle payment callbacks from Malipo.",
        mimeType: "text/markdown",
        text: `# Malipo Webhooks Guide

Webhooks are the recommended way to track payment completion. Malipo sends a \`POST\` request to your configured callback URL when a transaction reaches a final state.

## 1. Webhook Headers
The callback includes an \`X-Signature\` header containing an HMAC-SHA256 signature of the payload using your API secret key.

\`\`\`json
{
  "Content-Type": "application/json",
  "X-Signature": "<HMAC_SHA256_SIGNATURE>"
}
\`\`\`

## 2. Webhook Payload Structure
\`\`\`json
{
  "transaction_id": "TXNVV3BHMU",
  "status": "COMPLETED",
  "reference_id": "REF12345",
  "amount": "1500.00",
  "payment_date": "2024-11-25 14:30:45",
  "timestamp": "2024-11-25 16:45:10"
}
\`\`\`

## 3. Implementation Strategy
1. **Endpoint**: Create a public \`POST\` endpoint (e.g., \`/api/malipo/callback\`).
2. **Signature verification**: Compute HMAC-SHA256 of the raw payload with your \`secret_key\` and compare it to the \`X-Signature\` header.
3. **Idempotency**: Always check your database to see if the \`transaction_id\` has already been processed to avoid duplicate fulfillment.
4. **Response**: Return a \`200 OK\` quickly. If you fail to respond, Malipo may retry the callback up to 5 times.`
    },
    {
        uri: "malipo://examples/node-express",
        name: "Node.js Express Integration snippet",
        description: "A golden example of a Malipo payment integration using Express.js.",
        mimeType: "text/javascript",
        text: `// Malipo Payment Integration (Express.js) - Golden Example
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();
const MALIPO_BASE_URL = 'https://pay.tunzaa.co.tz';

// 1. Checkout Endpoint
router.post('/checkout', async (req, res) => {
  try {
    const { amount, phone, orderId } = req.body;

    // Get Token (Implement caching in production!)
    const authRest = await axios.post(\`\${MALIPO_BASE_URL}/accounts/request/token\`, {
      api_key: process.env.MALIPO_API_KEY,
      secret_key: process.env.MALIPO_SECRET_KEY
    }, {
      headers: { 'X-Environment': 'sandbox' }
    });

    const token = authRest.data.access_token;

    // Initiate Payment
    const paymentResp = await axios.post(\`\${MALIPO_BASE_URL}/payments/initiate-payment\`, {
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
// Use express.raw() or a body parser that preserves the raw body for signature verification.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body;
  const signature = req.headers['x-signature'];

  if (!signature) {
    return res.status(400).send('Missing signature');
  }

  const expected = crypto
    .createHmac('sha256', process.env.MALIPO_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).send('Invalid signature');
  }

  const payload = JSON.parse(rawBody);
  const { transaction_id, status, reference_id } = payload;

  console.log(\`Received Malipo payment [\${status}] for order \${reference_id}\`);

  if (status === 'COMPLETED') {
    // TODO: Update order in DB
    // await db.orders.update({ id: reference_id }, { status: 'PAID' });
  }

  res.sendStatus(200);
});

export default router;`
    }
];
