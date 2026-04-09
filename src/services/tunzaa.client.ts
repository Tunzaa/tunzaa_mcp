import axios, { AxiosInstance } from "axios";
import { config, isMockMode } from "../config.js";
import { AuthService } from "./auth.service.js";
import {
    PaymentRequest,
    PaymentStatusRequest,
    CreateInstallmentRequest,
    ListInstallmentsRequest,
    GetInstallmentRequest,
    EditInstallmentRequest,
    DeleteInstallmentRequest
} from "../types.js";

export interface ITunzaaClient {
    initiatePayment(args: PaymentRequest): Promise<any>;
    getPaymentStatus(args: PaymentStatusRequest): Promise<any>;
    createInstallment(args: CreateInstallmentRequest): Promise<any>;
    listInstallments(args: ListInstallmentsRequest): Promise<any>;
    getInstallmentPlan(args: GetInstallmentRequest): Promise<any>;
    editInstallmentPlan(args: EditInstallmentRequest): Promise<any>;
    deleteInstallmentPlan(args: DeleteInstallmentRequest): Promise<any>;
}

export class LiveTunzaaClient implements ITunzaaClient {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    private async getHeaders(address?: string) {
        const token = await this.authService.ensureToken(address);
        return {
            Authorization: `Bearer ${token}`,
            "X-Environment": config.ENVIRONMENT,
            "Content-Type": "application/json",
        };
    }

    private getAxiosInstance(address?: string): AxiosInstance {
        return axios.create({
            baseURL: address || config.API_BASE_URL,
        });
    }

    async initiatePayment(args: PaymentRequest): Promise<any> {
        const { address, ...data } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).post("/payments/initiate-payment", data, { headers });
        return response.data;
    }

    async getPaymentStatus(args: PaymentStatusRequest): Promise<any> {
        const { transactionID, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).get(`/payments/check-status/${transactionID}`, { headers });
        return response.data;
    }

    async createInstallment(args: CreateInstallmentRequest): Promise<any> {
        const { address, ...data } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).post("/installments/create", data, { headers });
        return response.data;
    }

    async listInstallments(args: ListInstallmentsRequest): Promise<any> {
        const { address, from = 0, limit = 20 } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).post(`/installments?from=${from}&limit=${limit}`, {}, { headers });
        return response.data;
    }

    async getInstallmentPlan(args: GetInstallmentRequest): Promise<any> {
        const { plan_id, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).get(`/installments/${plan_id}`, { headers });
        return response.data;
    }

    async editInstallmentPlan(args: EditInstallmentRequest): Promise<any> {
        const { plan_id, updates, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).put(`/installments/${plan_id}/update`, updates, { headers });
        return response.data;
    }

    async deleteInstallmentPlan(args: DeleteInstallmentRequest): Promise<any> {
        const { plan_id, address } = args;
        const headers = await this.getHeaders(address);
        const response = await this.getAxiosInstance(address).delete(`/installments/${plan_id}/cancel`, { headers });
        return response.data;
    }
}

export class MockTunzaaClient implements ITunzaaClient {
    async initiatePayment(args: PaymentRequest): Promise<any> {
        return {
            statusCode: 202,
            success: true,
            message: "Payment request accepted and being processed (MOCK)",
            transactionID: "MOCK_TXN_12345"
        };
    }

    async getPaymentStatus(args: PaymentStatusRequest): Promise<any> {
        return {
            transactionID: args.transactionID,
            status: "COMPLETED",
            message: "Transaction successful (MOCK)"
        };
    }

    async createInstallment(args: CreateInstallmentRequest): Promise<any> {
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

    async listInstallments(args: ListInstallmentsRequest): Promise<any> {
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

    async getInstallmentPlan(args: GetInstallmentRequest): Promise<any> {
        return {
            plan_id: args.plan_id,
            name: "Mock Plan Details",
            status: "active"
        };
    }

    async editInstallmentPlan(args: EditInstallmentRequest): Promise<any> {
        return {
            plan_id: args.plan_id,
            message: "Plan updated successfully (MOCK)"
        };
    }

    async deleteInstallmentPlan(args: DeleteInstallmentRequest): Promise<any> {
        return {
            plan_id: args.plan_id,
            message: "Plan deleted successfully (MOCK)",
            status: "cancelled"
        };
    }
}

export const getTunzaaClient = (authService: AuthService): ITunzaaClient => {
    return isMockMode ? new MockTunzaaClient() : new LiveTunzaaClient(authService);
};
