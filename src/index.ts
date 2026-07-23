#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MalipoServer } from "./server.js";

const server = new MalipoServer();
const transport = new StdioServerTransport();

server.run(transport).catch((error) => {
    console.error("Fatal error running Malipo MCP Server:", error);
    process.exit(1);
});