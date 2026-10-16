# Decisions

## Commerce (soko) tools — issue #7

Context: let agents purchase from the Tunzaa soko via the MCP. Demo only, guest
buyers, human-approved payment. Marketplace backend is
`whitelabel-api/services/marketplace-service` behind the Kong gateway at
`api.demo.tunzaa.co.tz` (`/v1/...` routes, `X-Tenant-ID` header required).

### Chosen
- **Extend the existing server, one tool group.** Reuses mock mode, config, and
  the single `formatError` handler. Considered a separate MCP server; rejected —
  two installs for agents and duplicated config for no isolation benefit at this
  scope.
- **Guest-only checkout.** The marketplace allows guest cart/order/pay for
  full-payment orders; installments require an authenticated buyer. Matches the
  "demo, guests" decision. Buyer-token support deferred.
- **`create_order` reads the amount from `/carts/{id}/totals`** rather than
  trusting a caller-supplied figure, so the order amount always matches the cart.
- **No per-call base-URL override on commerce tools.** The payment tools accept
  an `address` override (allowlist-guarded); commerce tools do not. Considered
  mirroring the payment tools' override; rejected — the operator-set
  `MALIPO_COMMERCE_BASE_URL` is enough for demo, and omitting overrides removes
  the SSRF surface entirely.
- **`pay_order` is a distinct tool, separate from `create_order`.** Create is
  reversible and charges nothing; pay moves money and is gated by the MCP
  client's own approval prompt. No single "buy" tool that creates-and-pays.
- **Mock mode keyed on `MALIPO_TENANT_ID` being unset**, mirroring how the
  payment tools mock on missing API keys. Lets agents be grounded with no tenant
  and no network.

### Rejected / deferred
- **`get_order` tool.** `GET /v1/orders/number/{n}` calls `require_caller` and is
  not a public read, so a guest always gets 401. Almost shipped it; removed after
  the live 401. `create_order` already returns the full order, so guests lose
  nothing. Revisit if/when buyer tokens are supported.
- **Spend cap.** Explicitly not wanted for now (CTO decision).
- **Production soko.** Out of scope; a prod base URL stays behind a future
  explicit flag.

### Known backend behaviors (not MCP bugs)
- Guest checkout provisions a buyer account from the shipping phone/email; if one
  already exists it returns 409 "log in to complete your purchase."
- `create_order` requires `payment_details.payment_gateway`; we send `tunzaa`
  with `method: mobile_money`.

### Tested
- Mock: full flow (all tools).
- Live (demo): `search_products`, `create_cart`, `add_to_cart`, `view_cart`,
  `create_order`.
- Edge cases (verified):
  - `get_product` with neither id nor slug → validation error
  - `quantity` ≤ 0, `limit` > 100 → validation error
  - invalid `product_id` → 404; invalid/empty `cart_id` → 404
  - empty cart → `create_order` → 400 "Cart has no items"
  - guest checkout on an already-registered phone → 409 "log in to complete"
  - `pay_order` on a nonexistent order → 404, **no charge**
- `pay_order` happy path: verified live on demo (payments are sandboxed there) —
  order paid, `202 Sandbox payment request accepted`, transaction id returned.

## Remote HTTP transport for Claude connector — issue #9

Context: run the server as a Claude.ai org connector. Connectors are remote MCP
servers (public HTTPS URL, Streamable HTTP); the server was stdio-only.

### Chosen
- **Second entrypoint `src/http.ts`** using the SDK's
  `StreamableHTTPServerTransport`; `index.ts` (stdio) is unchanged. One
  `MalipoServer` per MCP session, kept in a session map.
- **Node's built-in `http`**, no express/framework — keeps deps lean (only the
  SDK, already present).
- **Bearer guard**: if `MCP_AUTH_TOKEN` is set, every `/mcp` request must send
  `Authorization: Bearer <token>`; if unset, the endpoint is unauthenticated and
  logs a warning (local only). Safe-by-default for a public endpoint; no per-user
  OAuth (demo-only scope).
- **Demo-only single tenant**: deployment pins `MALIPO_TENANT_ID` to the demo
  tenant; payment/installment tools stay in mock (no API keys set).
- **SIGINT registration made idempotent** (module-level flag) so the per-session
  server instances don't leak process listeners.
- **Dockerfile** (multi-stage, non-root `node` user) for deployment; host TBD.

### Rejected / deferred
- Per-user OAuth + multi-tenant routing — out of scope (demo-only).
- Stateless per-request transport — rejected; session map keeps follow-up
  requests on the same server instance.

### Tested
- Build clean. Live HTTP smoke test: initialize + `list_tools` (17) +
  `search_products` against the demo returned data; a request without the bearer
  token returned HTTP 401; `/health` returns 200.
- Not yet deployed (awaiting host).
