# Tunzaa MCP Server

**Grounding for AI-Driven Payment Integrations**

The Tunzaa MCP Server is a developer-centric tool designed to help you integrate Tunzaa Payments into your applications. It provides high-fidelity grounding data that allows AI agents (like Claude or Cursor) to generate perfect, non-hallucinated integration code, boilerplate, and webhook handlers for the Tunzaa ecosystem.

## 🚀 Instant Start (Fastest Way)

You can run the server directly from GitHub without cloning or installing dependencies. Add this to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tunzaa": {
      "command": "npx",
      "args": ["-y", "github:Tunzaa/tunzaa_mcp"]
    }
  }
}
```

## Features

- **Vibe Coder Optimized**: Built to help AI agents understand and implement Tunzaa APIs correctly without needing live credentials.
- **Mock Mode by Default**: Generates "Golden" mock data that matches the real Tunzaa API structure, allowing for perfect code generation.
- **Zero Configuration**: Get up and running in seconds with the `npx` method above.
- **Live Mode (Optional)**: Support for real-time verification against the Tunzaa Sandbox/Production.

## Usage (Claude Desktop)

### 1. Standard Mode (No Keys Required)
Use this if you just want the AI to write Tunzaa logic for your project. This is the default when using the "Instant Start" method above.

### 2. Live Mode (Verification)
To have the AI verify **real data** from your Tunzaa account (e.g., checking transaction statuses), add your credentials to the `env` block in your config:

```json
{
  "mcpServers": {
    "tunzaa": {
      "command": "npx",
      "args": ["-y", "github:Tunzaa/tunzaa_mcp"],
      "env": {
        "TUNZAA_API_KEY": "your_api_key",
        "TUNZAA_SECRET_KEY": "your_secret_key",
        "TUNZAA_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

## Local Development (Cloning)

If you'd like to modify the server or contribute:

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Tunzaa/tunzaa_mcp.git
    cd tunzaa_mcp
    pnpm install
    ```
2.  **Build**:
    ```bash
    pnpm run build
    ```
3.  **Local Config**: Use the local path in your config:
    ```json
    "args": ["/ABSOLUTE/PATH/TO/tunzaa_mcp/dist/index.js"]
    ```

## Grounding Tools Available

- `get_token`: Inspect the token structure.
- `initiate_payment`: Ground payment request/response logic.
- `create_installment`: Ground complex installment structures.
- `handle_callback`: Generate validated webhook payload examples.
- `create_demo_shop`: **Master Grounding Tool**. Performs a full sequence of API calls to help the AI generate complete integration logic.

## License

ISC
