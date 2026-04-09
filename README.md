# Tunzaa MCP Server

**Grounding for AI-Driven Payment Integrations**

The Tunzaa MCP Server is a developer-centric tool designed to help you integrate Tunzaa Payments into your applications with ease. Beyond simple API calls, it provides rich "live traces" and high-fidelity grounding data that allow AI agents (like Claude or Cursor) to generate perfect, non-hallucinated integration code, boilerplate, and webhook handlers for the Tunzaa ecosystem.

## Features

- **Vibe Coder Optimized**: Built specifically to help AI agents understand and implement Tunzaa APIs correctly.
- **Auto-Auth**: Internal token management and background refreshing—no need to pass sensitive keys to your AI tools.
- **Grounding Tools**: Standardized responses that help agents "learn" the Tunzaa API structure in real-time.
- **Mock Mode**: Fully functional simulation mode for testing integrations without live credentials.

## Prerequisites

- Node.js (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended)
- Tunzaa API Credentials (`TUNZAA_API_KEY`, `TUNZAA_SECRET_KEY`) for Live Mode.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Tunzaa/tunzaa_mcp.git
    cd tunzaa_mcp
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Build the server:
    ```bash
    pnpm run build
    ```

## Usage

### Local Configuration (Claude Desktop)

To use the server, add it to your `claude_desktop_config.json`:

#### Mock Mode (No Credentials)
```json
{
  "mcpServers": {
    "tunzaa": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/tunzaa_mcp/dist/index.js"]
    }
  }
}
```

#### Live Mode (With Credentials)
```json
{
  "mcpServers": {
    "tunzaa": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/tunzaa_mcp/dist/index.js"],
      "env": {
        "TUNZAA_API_KEY": "your_api_key",
        "TUNZAA_SECRET_KEY": "your_secret_key",
        "TUNZAA_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

> [!IMPORTANT]
> Replace `/ABSOLUTE/PATH/TO/` with the actual path to your clone of this repository.

## Tools Available

- `get_token`: Verify connectivity and inspect token structures.
- `initiate_payment`: Ground payment request/response logic (M-Pesa, etc.).
- `get_payment_status`: Understand the lifecycle of a transaction.
- `create_installment`: Ground complex installment plan structures.
- `list_installments`: Inspect pagination and listing logic.
- `get_installment_plan`: See detailed plan fields and schedules.
- `edit_installment_plan`: Understand which fields are mutable.
- `delete_installment_plan`: Ground cancellation/voiding logic.
- `handle_callback`: Simulate and validate webhook payloads for your server.
- `create_demo_shop`: **The Ultimate Grounding Tool**. Runs a full sequence of API calls to help the AI generate perfect end-to-end integration code.

## License

ISC
