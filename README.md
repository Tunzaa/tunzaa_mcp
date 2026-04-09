# Tunzaa MCP Server

**Grounding for AI-Driven Payment Integrations**

The Tunzaa MCP Server is a developer-centric tool built for the community. It provides high-fidelity grounding data, integrated documentation, and "Golden" code patterns that allow AI agents (vibe coders) to generate perfect, non-hallucinated integration code for the Tunzaa ecosystem.

## 🚀 Instant Start (Fastest Way)

You can run the server directly from GitHub without cloning or installing dependencies. 

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
3. Name: `Tunzaa` | Type: `command` | Value: `npx -y github:Tunzaa/tunzaa_mcp`

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

---

## 🧭 The Vibe Coding Workflow

This server is designed to help you build Tunzaa integrations in minutes. Follow this flow with your AI assistant:

1. **Grounding**: Add this MCP server to your project.
2. **Exploration**: Ask the AI: *"List the Tunzaa resources and read the authentication guide."*
3. **Simulation**: Run the tool: `create_demo_shop` to see a live trace of a successful integration.
4. **Generation**: Ask the AI: *"Based on the grounding trace and the node-express example, build a checkout page for my app."*

---

## 🏪 The Grounding "Demo Shop"

The `create_demo_shop` tool is the cornerstone of this platform. It doesn't just return data; it provides a **Live Grounding Trace**.

### How to use it:
1. **Trigger the Simulation**: Tell your AI agent: *"Run the Tunzaa create_demo_shop tool to understand the payment flow."*
2. **Review the Trace**: The agent will receive a chronological sequence of calls including Authentication, Payment Initiation, and Installment creation.
3. **Production Implementation**: Each step in the trace contains "Grounding Insights" that teach the agent how to handle state, headers, and reference IDs in your actual code.
4. **Boilerplate**: Ask the agent to *"Convert the grounding trace into a [Node/Python/PHP] implementation using the best practices found in the documentation resources."*

---

## ✨ Features

- **Integrated Documentation**: AI agents can "read" guides on Auth, Payments, and Webhooks directly through MCP Resources.
- **Golden Patterns**: Embedded code snippets for Express.js, React Hooks, and more.
- **Vibe Coder Optimized**: Rich schema descriptions and instructional traces (via `create_demo_shop`) ensure zero hallucination.
- **Mock Mode by Default**: Generates "Golden" mock data matching the real Tunzaa API structure.
- **Live Mode (Optional)**: Real-time verification against the Tunzaa Sandbox/Production.

---

## 🛠️ Usage (Live Mode)

To have the AI verify **real data** from your Tunzaa account (e.g., checking transaction statuses), add your credentials to the `env` block in your config:

```json
"env": {
  "TUNZAA_API_KEY": "your_api_key",
  "TUNZAA_SECRET_KEY": "your_secret_key",
  "TUNZAA_ENVIRONMENT": "sandbox"
}
```

---

## 🏗️ Local Development

If you'd like to contribute or modify the server:

1. `git clone https://github.com/Tunzaa/tunzaa_mcp.git`
2. `cd tunzaa_mcp && pnpm install && pnpm run build`
3. Use the local path in your config: `"args": ["/ABSOLUTE/PATH/TO/tunzaa_mcp/dist/index.js"]`

## License
ISC
