"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTunzaaClient = exports.MockTunzaaClient = exports.LiveTunzaaClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("../config.js");
class LiveTunzaaClient {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async getHeaders(address) {
        const token = await this.authService.ensureToken(address);
        return {
            Authorization: `Bearer ${token}`,
            "X-Environment": config_js_1.config.ENVIRONMENT,
            "Content-Type": "application/json",
        };
    }
    getAxiosInstance(address) {
        return axios_1.default.create({
            baseURL: address || config_js_1.config.API_BASE_URL,
        });
    }
    async initiatePayment(args) {
        const { address, ...data } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).post("/payments/initiate-payment", data, { headers });
        return response.data;
    }
    async getPaymentStatus(args) {
        const { transactionID, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).get(`/payments/check-status/${transactionID}`, { headers });
        return response.data;
    }
    async createInstallment(args) {
        const { address, ...data } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).post("/installments/create", data, { headers });
        return response.data;
    }
    async listInstallments(args) {
        const { address, from = 0, limit = 20 } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).post(`/installments?from=${from}&limit=${limit}`, {}, { headers });
        return response.data;
    }
    async getInstallmentPlan(args) {
        const { plan_id, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).get(`/installments/${plan_id}`, { headers });
        return response.data;
    }
    async editInstallmentPlan(args) {
        const { plan_id, updates, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).put(`/installments/${plan_id}/update`, updates, { headers });
        return response.data;
    }
    async deleteInstallmentPlan(args) {
        const { plan_id, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).delete(`/installments/${plan_id}/cancel`, { headers });
        return response.data;
    }
}
exports.LiveTunzaaClient = LiveTunzaaClient;
class MockTunzaaClient {
    async initiatePayment(args) {
        return {
            statusCode: 202,
            success: true,
            message: "Payment request accepted and being processed (MOCK)",
            transactionID: "MOCK_TXN_12345"
        };
    }
    async getPaymentStatus(args) {
        return {
            transactionID: args.transactionID,
            status: "COMPLETED",
            message: "Transaction successful (MOCK)"
        };
    }
    async createInstallment(args) {
        return {
            message: "Installment plan created successfully (MOCK)",
            plan_id: 1001,
            status: "active",
            next_payment_date: args.start_date,
            installments: [
                { installment_number: 1, amount: args.total_amount / 2, due_date: args.start_date, status: "PENDING" },
                { installment_number: 2, amount: args.total_amount / 2, due_date: args.end_date, status: "PENDING" }
            ]
        };
    }
    async listInstallments(args) {
        return [
            {
                plan_id: 1001,
                name: "Samsung S20 Mock Plan",
                total_amount: "500000",
                remaining_balance: "250000",
                status: "active"
            }
        ];
    }
    async getInstallmentPlan(args) {
        return {
            plan_id: args.plan_id,
            name: "Mock Plan Details",
            status: "active"
        };
    }
    async editInstallmentPlan(args) {
        return {
            plan_id: args.plan_id,
            message: "Plan updated successfully (MOCK)"
        };
    }
    async deleteInstallmentPlan(args) {
        return {
            plan_id: args.plan_id,
            message: "Plan deleted successfully (MOCK)",
            status: "cancelled"
        };
    }
}
exports.MockTunzaaClient = MockTunzaaClient;
const getTunzaaClient = (authService) => {
    return config_js_1.isMockMode ? new MockTunzaaClient() : new LiveTunzaaClient(authService);
};
exports.getTunzaaClient = getTunzaaClient;
