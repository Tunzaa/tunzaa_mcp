"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("../config.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
class AuthService {
    token = null;
    tokenExpiry = null;
    async ensureToken(address) {
        if (config_js_1.isMockMode)
            return "MOCK_ACCESS_TOKEN";
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }
        const data = await this.fetchToken(address);
        return data.access_token;
    }
    async fetchToken(address) {
        if (config_js_1.isMockMode) {
            return {
                access_token: "MOCK_ACCESS_TOKEN",
                expires_in: 3600,
                token_type: "Bearer"
            };
        }
        try {
            const baseURL = address || config_js_1.config.API_BASE_URL;
            const response = await axios_1.default.post(`${baseURL}/accounts/request/token`, {
                api_key: config_js_1.config.API_KEY,
                secret_key: config_js_1.config.SECRET_KEY,
            }, { headers: { 'Content-Type': 'application/json' } });
            const data = response.data;
            this.token = data.access_token;
            // Set expiry 60s early for safety buffer
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return data;
        }
        catch (error) {
            console.error("Token fetch failed:", error.message);
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }
    getToken() {
        return this.token;
    }
}
exports.AuthService = AuthService;
