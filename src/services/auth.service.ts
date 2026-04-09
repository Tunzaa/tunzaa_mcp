import axios from "axios";
import { config, isMockMode } from "../config.js";
import { TokenResponse } from "../types.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class AuthService {
    private token: string | null = null;
    private tokenExpiry: number | null = null;

    async ensureToken(address?: string): Promise<string | null> {
        if (isMockMode) return "MOCK_ACCESS_TOKEN";

        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        const data = await this.fetchToken(address);
        return data.access_token;
    }

    private async fetchToken(address?: string): Promise<TokenResponse> {
        if (isMockMode) {
            return {
                access_token: "MOCK_ACCESS_TOKEN",
                expires_in: 3600,
                token_type: "Bearer"
            };
        }

        try {
            const baseURL = address || config.API_BASE_URL;
            const response = await axios.post(`${baseURL}/accounts/request/token`, {
                api_key: config.API_KEY,
                secret_key: config.SECRET_KEY,
            }, { headers: { 'Content-Type': 'application/json' } });

            const data = response.data;
            this.token = data.access_token;
            // Set expiry 60s early for safety buffer
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return data;
        } catch (error: any) {
            console.error("Token fetch failed:", error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to get token: ${error.message}`);
        }
    }

    getToken(): string | null {
        return this.token;
    }
}
