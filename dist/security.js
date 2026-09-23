"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBaseUrl = resolveBaseUrl;
exports.maskToken = maskToken;
exports.displayToken = displayToken;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const config_js_1 = require("./config.js");
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);
const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
const reject = (message) => {
    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, message);
};
const configuredOrigin = (() => {
    try {
        return new URL(config_js_1.config.API_BASE_URL).origin;
    }
    catch {
        return null;
    }
})();
function matchesAllowedHost(url) {
    return config_js_1.config.ALLOWED_HOSTS.some(rawEntry => {
        const entry = rawEntry.toLowerCase();
        if (entry.includes("://")) {
            try {
                return new URL(entry).origin === url.origin;
            }
            catch {
                return false;
            }
        }
        // A bare "host" matches any port on that host; "host:port" must match exactly.
        return entry === url.host || (!entry.includes(":") && entry === url.hostname);
    });
}
/**
 * Resolves the API base URL for a request. Model-supplied overrides are only
 * honoured for the operator-configured MALIPO_API_BASE_URL origin or hosts
 * listed in MALIPO_ALLOWED_HOSTS, so credentials never leave for other hosts.
 */
function resolveBaseUrl(address) {
    if (!address)
        return stripTrailingSlash(config_js_1.config.API_BASE_URL);
    let url;
    try {
        url = new URL(address);
    }
    catch {
        return reject(`Invalid address: "${address}" is not a valid URL.`);
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
        return reject(`Invalid address: only http(s) URLs are supported.`);
    }
    if (url.username || url.password) {
        return reject(`Invalid address: URLs with embedded credentials are not allowed.`);
    }
    const resolved = stripTrailingSlash(url.origin + url.pathname);
    // The operator set MALIPO_API_BASE_URL, so its origin is always trusted.
    if (url.origin === configuredOrigin)
        return resolved;
    if (url.protocol !== "https:" && !LOCAL_HOSTNAMES.has(url.hostname)) {
        return reject(`address must use HTTPS (plain HTTP is only allowed for localhost): ${url.origin}`);
    }
    if (!matchesAllowedHost(url)) {
        return reject(`address not in allowlist; set MALIPO_ALLOWED_HOSTS to allow ${url.host}`);
    }
    return resolved;
}
/** Masks a bearer token for display, e.g. "eyJh…x9Q". */
function maskToken(token) {
    if (!token)
        return token;
    if (token.length <= 12)
        return "****";
    return `${token.slice(0, 4)}…${token.slice(-3)}`;
}
/** The token as it should appear in tool output. */
function displayToken(token) {
    return config_js_1.config.EXPOSE_TOKEN ? token : maskToken(token);
}
