#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MalipoServer } from "./server.js";

const server = new MalipoServer();
const transport = new StdioServerTransport();

server.run(transport)
    .then(() => console.error("Malipo MCP Server running on stdio"))
    .catch((error) => {
        console.error("Fatal error running Malipo MCP Server:", error);
        process.exit(1);
    });