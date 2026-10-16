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
