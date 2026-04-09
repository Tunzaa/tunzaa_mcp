#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TunzaaServer } from "./server.js";

const server = new TunzaaServer();
const transport = new StdioServerTransport();

server.run(transport).catch((error) => {
    console.error("Fatal error running Tunzaa MCP Server:", error);
    process.exit(1);
});