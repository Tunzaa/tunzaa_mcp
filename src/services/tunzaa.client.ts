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
        const { address, sandbox_scenario, ...data } = args as any;
        const headers: Record<string, string> = await this.getHeaders(address);
        if (sandbox_scenario) {
            headers["X-Sandbox-Scenario"] = sandbox_scenario;
        }
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
        const { address, from, limit } = args;
        const headers = await this.getHeaders(address);
        const params: Record<string, string | number> = {};
        if (from !== undefined) params.from = from;
        if (limit !== undefined) params.limit = limit;
        const response = await this.getAxiosInstance(address).get("/installments/", { headers, params });
        return response.data;
    }

    async getInstallmentPlan(args: GetInstallmentRequest): Promise<any> {
        const { plan_id, include_payments, address } = args;
        const headers = await this.getHeaders(address);
        const params: Record<string, string> = {};
        if (include_payments) params.include_payments = "true";
        const response = await this.getAxiosInstance(address).get(`/installments/${plan_id}`, { headers, params });
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
            statusCode: 200,
            success: true,
            message: "Transaction status retrieved successfully (MOCK)",
            data: {
                transactionID: args.transactionID,
                status: "COMPLETED",
                amount: "1000.00",
                customerMsisdn: "255700000000",
                paymentDate: "2024-11-25T14:30:45",
                utilityref: "REF12345",
                remark: "Payment processed successfully (MOCK)"
            }
        };
    }

    async createInstallment(args: CreateInstallmentRequest): Promise<any> {
        return {
            customer: {
                customer_id: 1234,
                first_name: args.customer.first_name,
                last_name: args.customer.last_name,
                phone: args.customer.phone,
                address: args.customer.address,
                created_at: "2024-01-01T00:00:00",
                updated_at: "2024-01-01T00:00:00"
            },
            plan: {
                plan_id: 1001,
                customer: 1234,
                name: args.name,
                description: args.description,
                total_amount: args.total_amount.toFixed(2),
                paid_amount: "0.00",
                remaining_balance: args.total_amount.toFixed(2),
                payment_frequency: args.payment_frequency,
                start_date: args.start_date,
                end_date: args.end_date,
                custom_interval: args.custom_interval || null,
                status: "active"
            },
            installments: [
                {
                    installment_id: 10000,
                    installment_number: 1,
                    amount: (args.total_amount / 2).toFixed(2),
                    due_date: args.start_date,
                    status: "PENDING",
                    created_at: "2024-01-01T00:00:00",
                    updated_at: "2024-01-01T00:00:00"
                },
                {
                    installment_id: 10001,
                    installment_number: 2,
                    amount: (args.total_amount / 2).toFixed(2),
                    due_date: args.end_date,
                    status: "PENDING",
                    created_at: "2024-01-01T00:00:00",
                    updated_at: "2024-01-01T00:00:00"
                }
            ]
        };
    }

    async listInstallments(args: ListInstallmentsRequest): Promise<any> {
        return {
            count: 1,
            next_page: null,
            previous_page: null,
            results: [
                {
                    plan_id: 1001,
                    name: "Samsung S20 Mock Plan",
                    description: "Smartphone purchase (MOCK)",
                    total_amount: "500000.00",
                    paid_amount: "0.00",
                    remaining_balance: "500000.00",
                    payment_frequency: "monthly",
                    start_date: "2024-01-01",
                    end_date: "2024-06-01",
                    status: "active"
                }
            ]
        };
    }

    async getInstallmentPlan(args: GetInstallmentRequest): Promise<any> {
        return {
            customer: {
                customer_id: 1234,
                first_name: "John",
                last_name: "Doe",
                phone: "255700000000",
                address: "Dar es Salaam",
                created_at: "2024-01-01T00:00:00",
                updated_at: "2024-01-01T00:00:00"
            },
            plan: {
                plan_id: args.plan_id,
                customer: 1234,
                name: "Samsung S20",
                description: "Smartphone purchase (MOCK)",
                total_amount: "500000.00",
                paid_amount: "0.00",
                remaining_balance: "500000.00",
                payment_frequency: "monthly",
                start_date: "2024-01-01",
                end_date: "2024-06-01",
                custom_interval: null,
                status: "active"
            },
            installments: [
                {
                    installment_id: 10000,
                    installment_number: 1,
                    amount: "83334.00",
                    due_date: "2024-01-01",
                    status: "PENDING",
                    created_at: "2024-01-01T00:00:00",
                    updated_at: "2024-01-01T00:00:00"
                }
            ]
        };
    }

    async editInstallmentPlan(args: EditInstallmentRequest): Promise<any> {
        return {
            customer: {
                customer_id: 1234,
                first_name: "John",
                last_name: "Doe",
                phone: "255711111111",
                address: "Dar es Salaam",
                created_at: "2024-01-01T00:00:00",
                updated_at: "2024-01-01T00:00:00"
            },
            plan: {
                plan_id: args.plan_id,
                customer: 1234,
                name: "Samsung S20",
                description: "Smartphone purchase (MOCK)",
                total_amount: "450000.00",
                paid_amount: "0.00",
                remaining_balance: "450000.00",
                payment_frequency: "monthly",
                start_date: "2024-01-01",
                end_date: "2024-06-01",
                custom_interval: null,
                status: "active"
            },
            installments: [
                {
                    installment_id: 10000,
                    installment_number: 1,
                    amount: "75000.00",
                    due_date: "2024-01-01",
                    status: "PENDING",
                    created_at: "2024-01-01T00:00:00",
                    updated_at: "2024-01-01T00:00:00"
                }
            ]
        };
    }

    async deleteInstallmentPlan(args: DeleteInstallmentRequest): Promise<any> {
        return {
            message: "Plan and its installments have been cancelled successfully. (MOCK)",
            plan_id: args.plan_id,
            plan_status: "cancelled",
            installments_updated: 4
        };
    }
}

export const getTunzaaClient = (authService: AuthService): ITunzaaClient => {
    return isMockMode ? new MockTunzaaClient() : new LiveTunzaaClient(authService);
};
