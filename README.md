# Tunzaa MCP Server

**Grounding for AI-Driven Payment Integrations**

The Tunzaa MCP Server is a developer-centric tool designed to help you integrate Tunzaa Payments into your applications. It provides high-fidelity grounding data that allows AI agents to generate perfect, non-hallucinated integration code, boilerplate, and webhook handlers for the Tunzaa ecosystem.

## 🚀 Instant Start (Fastest Way)

You can run the server directly from GitHub without cloning or installing dependencies. Simply use the configuration for your editor below.

---

## 🛠️ Setup by Editor

### 1. Claude Desktop
Add this to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

### 2. Cursor
1. Go to **Settings -> Features -> MCP**.
2. Click **+ Add New MCP Server**.
3. Name: `Tunzaa`
4. Type: `command`
5. Value: `npx -y github:Tunzaa/tunzaa_mcp`

### 3. Windsurf
Add this to your `~/.codeium/config.json`:

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

### 4. Antigravity (Coding Assistant)
Antigravity can automatically detect and use this server if you are working within this repository, or you can point it to the GitHub URL directly for grounding during a session.

### 5. Generic (Other MCP Clients)
For any other MCP-compatible client, the execution command is:
`npx -y github:Tunzaa/tunzaa_mcp`

---

## Features

- **Vibe Coder Optimized**: Built to help AI agents understand and implement Tunzaa APIs correctly without needing live credentials.
- **Mock Mode by Default**: Generates "Golden" mock data that matches the real Tunzaa API structure.
- **Zero Configuration**: Get up and running in seconds with the `npx` method.
- **Live Mode (Optional)**: Support for real-time verification against the Tunzaa Sandbox/Production.

## Usage (Live Mode)
To have the AI verify **real data** from your Tunzaa account (e.g., checking transaction statuses), add your credentials to the `env` block in your config:

```json
"env": {
  "TUNZAA_API_KEY": "your_api_key",
  "TUNZAA_SECRET_KEY": "your_secret_key",
  "TUNZAA_ENVIRONMENT": "sandbox"
}
```

## Local Development (Cloning)
If you'd like to contribute or modify the server:
1. `git clone https://github.com/Tunzaa/tunzaa_mcp.git`
2. `cd tunzaa_mcp && pnpm install && pnpm run build`
3. Use the local path in your config: `"args": ["/ABSOLUTE/PATH/TO/tunzaa_mcp/dist/index.js"]`

## License
ISC
