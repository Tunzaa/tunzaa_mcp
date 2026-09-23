import axios from "axios";
import { config, isMockMode } from "../config.js";
import { resolveBaseUrl } from "../security.js";
import { TokenResponse } from "../types.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export interface TokenInfo {
    token: string;
    expiresAt: number;
}

export class AuthService {
    // Keyed by resolved base URL so a token is only ever sent back to the host that issued it.
    private tokens = new Map<string, TokenInfo>();

    async ensureToken(address?: string): Promise<string | null> {
        return (await this.getTokenInfo(address)).token;
    }

    async getTokenInfo(address?: string): Promise<TokenInfo> {
        const baseURL = resolveBaseUrl(address);

        if (isMockMode) {
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

    private async fetchToken(baseURL: string): Promise<TokenResponse> {
        try {
            const response = await axios.post(`${baseURL}/accounts/request/token`, {
                api_key: config.API_KEY,
                secret_key: config.SECRET_KEY,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Environment': config.ENVIRONMENT,
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Token fetch failed:", error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }
}
