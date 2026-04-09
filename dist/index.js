#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const server_js_1 = require("./server.js");
const server = new server_js_1.TunzaaServer();
const transport = new stdio_js_1.StdioServerTransport();
server.run(transport).catch((error) => {
    console.error("Fatal error running Tunzaa MCP Server:", error);
    process.exit(1);
});
