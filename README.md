# Tunzaa MCP Server

An MCP server to integrate Tunzaa payments into LLMs.

## Prerequisites

- Node.js (v16 or higher)
- Tunzaa API Credentials (`TUNZAA_API_KEY`, `TUNZAA_SECRET_KEY`)

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the server:
    ```bash
    npm run build
    ```

## Usage

### Local Configuration (e.g., Claude Desktop)

To use this server with an MCP client like Claude Desktop, add the following to your configuration file (usually `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
```json
{
  "mcpServers": {
    "tunzaa": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/tunzaa_mcp/dist/index.js"
      ],
      "env": {
        "TUNZAA_API_KEY": "your_api_key",
        "TUNZAA_SECRET_KEY": "your_secret_key",
        "TUNZAA_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

### remote usage

```json
{
  "mcpServers": {
    "tunzaa": {
      "command": "npx",
      "args": [
        "-y",
        "github:whoisladleo/tunzaa-mcp"
      ],
      "env": {
        "TUNZAA_API_KEY": "your_api_key",
        "TUNZAA_SECRET_KEY": "your_secret_key",
        "TUNZAA_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/tunzaa_mcp` with the full path to this directory.

### Environment Variables

- `TUNZAA_API_KEY`: Your Tunzaa API Key.
- `TUNZAA_SECRET_KEY`: Your Tunzaa Secret Key.

## Tools Available

- `get_token`: Authenticate and retrieve a bearer token.
- `initiate_payment`: Start a payment transaction.
- `get_payment_status`: Check payment status.
- `create_installment`: Create a new installment plan.
- `list_installments`: List plans.
- `get_installment_plan`: Get plan details.
- `edit_installment_plan`: Update a plan.
- `delete_installment_plan`: Cancel a plan.
- `handle_callback`: Simulate/validate callback payloads.
