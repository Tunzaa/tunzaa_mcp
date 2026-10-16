#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const crypto_1 = require("crypto");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const server_js_1 = require("./server.js");
/**
 * Remote (Streamable HTTP) entrypoint so the server can run as a Claude.ai
 * connector. The stdio entrypoint (index.ts) is unchanged for local use.
 *
 * Config:
 *   PORT            — listen port (default 3000)
 *   MCP_AUTH_TOKEN  — if set, every /mcp request must carry
 *                     "Authorization: Bearer <token>". If unset, the endpoint
 *                     is UNAUTHENTICATED (a warning is logged) — intended only
 *                     for local testing, never a public deployment.
 */
const PORT = Number(process.env.PORT) || 3000;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || "";
const MCP_PATH = "/mcp";
// One transport per MCP session id, so a client's follow-up requests reach the
// same server instance.
const transports = {};
function sendJsonError(res, status, message) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }));
}
function isAuthorized(req) {
    if (!AUTH_TOKEN)
        return true; // unauthenticated mode (local only)
    const header = req.headers["authorization"];
    return typeof header === "string" && header === `Bearer ${AUTH_TOKEN}`;
}
async function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = "";
        req.on("data", chunk => {
            raw += chunk;
            if (raw.length > 1_000_000)
                reject(new Error("Request body too large"));
        });
        req.on("end", () => {
            if (!raw)
                return resolve(undefined);
            try {
                resolve(JSON.parse(raw));
            }
            catch {
                reject(new Error("Invalid JSON body"));
            }
        });
        req.on("error", reject);
    });
}
async function handlePost(req, res) {
    let body;
    try {
        body = await readJsonBody(req);
    }
    catch (e) {
        return sendJsonError(res, 400, e.message || "Bad request");
    }
    const sessionId = req.headers["mcp-session-id"];
    let transport = sessionId ? transports[sessionId] : undefined;
    if (!transport) {
        if (sessionId || !(0, types_js_1.isInitializeRequest)(body)) {
            return sendJsonError(res, 400, "Bad Request: no valid session id, or not an initialize request");
        }
        // New session: build a server and transport for it.
        transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
            sessionIdGenerator: () => (0, crypto_1.randomUUID)(),
            onsessioninitialized: (sid) => {
                transports[sid] = transport;
            },
        });
        transport.onclose = () => {
            if (transport.sessionId)
                delete transports[transport.sessionId];
        };
        const mcp = new server_js_1.MalipoServer();
        await mcp.run(transport);
    }
    await transport.handleRequest(req, res, body);
}
async function handleSessionStream(req, res) {
    const sessionId = req.headers["mcp-session-id"];
    const transport = sessionId ? transports[sessionId] : undefined;
    if (!transport) {
        return sendJsonError(res, 400, "Invalid or missing session id");
    }
    await transport.handleRequest(req, res);
}
const server = http_1.default.createServer(async (req, res) => {
    try {
        const url = (req.url || "").split("?")[0];
        if (req.method === "GET" && url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
            return;
        }
        if (url !== MCP_PATH) {
            return sendJsonError(res, 404, "Not found");
        }
        if (!isAuthorized(req)) {
            res.writeHead(401, { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" });
            res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null }));
            return;
        }
        if (req.method === "POST") {
            await handlePost(req, res);
        }
        else if (req.method === "GET" || req.method === "DELETE") {
            // GET opens the server->client SSE stream; DELETE ends the session.
            await handleSessionStream(req, res);
        }
        else {
            res.writeHead(405, { "Content-Type": "application/json", Allow: "GET, POST, DELETE" });
            res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null }));
        }
    }
    catch (e) {
        console.error("[HTTP] request error:", e?.message || e);
        if (!res.headersSent)
            sendJsonError(res, 500, "Internal server error");
    }
});
server.listen(PORT, () => {
    console.error(`Malipo MCP Server (HTTP) listening on :${PORT}${MCP_PATH}`);
    if (!AUTH_TOKEN) {
        console.error("WARNING: MCP_AUTH_TOKEN is not set — the endpoint is UNAUTHENTICATED. Set it before any public deployment.");
    }
});
