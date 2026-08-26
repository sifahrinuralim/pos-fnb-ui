import { writable } from 'svelte/store';
import * as orderApi from '$lib/api/orders';
import type { Order } from '$lib/api/orders';

interface OrderState {
    activeOrders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    activeOrders: [],
    currentOrder: null,
    loading: false,
    error: null
};

function createOrderStore() {
    const { subscribe, set, update } = writable<OrderState>(initialState);

    return {
        subscribe,
        loadActiveOrders: async (limit: number = 50) => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await orderApi.listActiveOrders(limit);
                update(s => ({ ...s, activeOrders: res.data, loading: false }));
            } catch (err: any) {
                update(s => ({ ...s, loading: false, error: err.message }));
            }
        },
        createOrder: async (data: any) => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await orderApi.createOrder(data);
                update(s => ({ ...s, currentOrder: res.data, loading: false }));
                return res.data;
            } catch (err: any) {
                update(s => ({ ...s, loading: false, error: err.message }));
                throw err;
            }
        },
        getOrder: async (id: string) => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await orderApi.getOrder(id);
                update(s => ({ ...s, currentOrder: res.data, loading: false }));
            } catch (err: any) {
                update(s => ({ ...s, loading: false, error: err.message }));
            }
        },
        updateStatus: async (id: string, status: string) => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await orderApi.updateOrderStatus(id, status);
                update(s => ({ 
                    ...s, 
                    currentOrder: s.currentOrder?.id === id ? res.data : s.currentOrder,
                    loading: false 
                }));
            } catch (err: any) {
                update(s => ({ ...s, loading: false, error: err.message }));
            }
        }
    };
}

export const orderStore = createOrderStore();
