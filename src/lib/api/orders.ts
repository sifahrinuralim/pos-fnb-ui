import { apiGet, apiPost, apiPatch, type ApiResponse } from '$lib/services/api';

export interface Order {
    id: string;
    table_number: number;
    order_type: 'dine_in' | 'takeaway' | 'gofood' | 'grabfood';
    status: 'pending' | 'in_kitchen' | 'ready' | 'served' | 'completed' | 'cancelled';
    items: { menu_id: string; quantity: number; price: number }[];
    total: number;
    created_at: string;
}

export async function createOrder(data: any): Promise<ApiResponse<Order>> {
    return await apiPost<Order>('/orders', data);
}

export async function listActiveOrders(limit: number = 50): Promise<ApiResponse<Order[]>> {
    return await apiGet<Order[]>('/orders', { limit });
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
    return await apiGet<Order>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return await apiPatch<Order>(`/orders/${id}/status`, { status });
}
