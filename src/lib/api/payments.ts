import { apiGet, apiPost } from '$lib/services/api';

export interface PaymentRequest {
    order_id: string;
    amount: number;
    method: 'cash' | 'qris' | 'card';
    reference_id?: string;
}

export interface Payment {
    id: string;
    order_id: string;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed';
    reference_id: string | null;
    created_at: string;
}

export const createPayment = (data: PaymentRequest) => 
    apiPost<Payment>('/payments', data);

export const listRecentPayments = (skip: number = 0, limit: number = 20) => 
    apiGet<Payment[]>('/payments', { skip, limit });

export const listPaymentsByOrder = (orderId: string) => 
    apiGet<Payment[]>(`/payments/order/${orderId}`);
