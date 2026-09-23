"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("../config.js");
const security_js_1 = require("../security.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
class AuthService {
    // Keyed by resolved base URL so a token is only ever sent back to the host that issued it.
    tokens = new Map();
    async ensureToken(address) {
        return (await this.getTokenInfo(address)).token;
    }
    async getTokenInfo(address) {
        const baseURL = (0, security_js_1.resolveBaseUrl)(address);
        if (config_js_1.isMockMode) {
            return { token: "MOCK_ACCESS_TOKEN", expiresAt: Date.now() + 3600 * 1000 };
        }
        const cached = this.tokens.get(baseURL);
        if (cached && Date.now() < cached.expiresAt) {
            return cached;
        }
        const data = await this.fetchToken(baseURL);
        const info = {
            token: data.access_token,
            // Set expiry 60s early for safety buffer
            expiresAt: Date.now() + (data.expires_in * 1000) - 60000,
        };
        this.tokens.set(baseURL, info);
        return info;
    }
    async fetchToken(baseURL) {
        try {
            const response = await axios_1.default.post(`${baseURL}/accounts/request/token`, {
                api_key: config_js_1.config.API_KEY,
                secret_key: config_js_1.config.SECRET_KEY,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Environment': config_js_1.config.ENVIRONMENT,
                }
            });
            return response.data;
        }
        catch (error) {
            console.error("Token fetch failed:", error.message);
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }
}
exports.AuthService = AuthService;
