# Tunzaa MCP Server

**Grounding for AI-Driven Payment Integrations**

The Tunzaa MCP Server helps you integrate Tunzaa Payments into your applications. It provides high-fidelity grounding data that allows AI agents (like Claude or Cursor) to generate perfect, non-hallucinated integration code, boilerplate, and webhook handlers for the Tunzaa ecosystem.

## Features

- **Vibe Coder Optimized**: Built specifically to help AI agents understand and implement Tunzaa APIs correctly without needing live credentials.
- **Mock Mode by Default**: Generates "Golden" mock data that matches the real Tunzaa API structure, allowing for perfect code generation without any setup.
- **Auto-Auth (Optional)**: Internal token management for those who want the AI to verify live production data.
- **Grounding Tools**: Standardized responses that help agents "learn" the Tunzaa API structure in real-time.

## Prerequisites

- Node.js (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Tunzaa/tunzaa_mcp.git
    cd tunzaa_mcp
    ```
2.  Install dependencies and build:
    ```bash
    pnpm install
    pnpm run build
    ```

## Usage (Claude Desktop)

To use the server, add it to your `claude_desktop_config.json`.

### 1. Standard Mode (Recommended for Vibe Coding)
**No API keys required.** Use this to have the AI help you write and implement Tunzaa logic in your project. It returns static example data that matches the real API structure.

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

### 2. Live Mode (Optional for Verification)
Use this if you want the AI to verify **real data** from your Tunzaa account (e.g., checking the status of a live transaction or creating real plans).

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

These tools provide the grounding necessary for an AI Agent to generate integration code:
- `get_token`: Inspect the token structure.
- `initiate_payment`: Ground payment request/response logic.
- `create_installment`: Ground complex installment structures.
- `handle_callback`: Generate validated webhook payload examples.
- `create_demo_shop`: **The Master Grounding Tool**. Performs a full sequence of API calls to help the AI generate complete end-to-end integration logic.

## License

ISC
