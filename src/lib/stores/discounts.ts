import { writable, get } from 'svelte/store';
import * as discountsApi from '$lib/api/discounts';
import type { ApiResponse } from '$lib/services/api';
import type { DiscountCreate, DiscountUpdate, DiscountResponse } from '$lib/api/discounts';

export interface DiscountsState {
    discounts: DiscountResponse[];
    loading: boolean;
    activeOnlyFilter: boolean | undefined;
}

const defaultState: DiscountsState = {
    discounts: [],
    loading: false,
    activeOnlyFilter: undefined
};

function createDiscountsStore() {
    const { subscribe, set, update } = writable<DiscountsState>({ ...defaultState });

    return {
        subscribe,

        async loadDiscounts(activeOnly?: boolean): Promise<void> {
            update((s) => ({ ...s, loading: true, activeOnlyFilter: activeOnly }));
            try {
                const response = await discountsApi.listDiscounts(activeOnly);
                if (response.success && Array.isArray(response.data)) {
                    update((s) => ({
                        ...s,
                        discounts: response.data,
                        loading: false
                    }));
                } else {
                    update((s) => ({ ...s, loading: false }));
                }
            } catch (error) {
                update((s) => ({ ...s, loading: false }));
                throw error;
            }
        },

        async createDiscount(payload: DiscountCreate): Promise<ApiResponse<DiscountResponse>> {
            const response = await discountsApi.createDiscount(payload);
            if (response.success && response.data) {
                update((s) => ({
                    ...s,
                    discounts: [...s.discounts, response.data!]
                }));
            }
            return response;
        },

        async updateDiscount(id: string, payload: DiscountUpdate): Promise<ApiResponse<DiscountResponse>> {
            const response = await discountsApi.updateDiscount(id, payload);
            if (response.success && response.data) {
                update((s) => ({
                    ...s,
                    discounts: s.discounts.map((d) => (d.id === id ? response.data! : d))
                }));
            }
            return response;
        },

        async deleteDiscount(id: string): Promise<ApiResponse<Record<string, never>>> {
            const response = await discountsApi.deleteDiscount(id);
            if (response.success) {
                update((s) => ({
                    ...s,
                    discounts: s.discounts.filter((d) => d.id !== id)
                }));
            }
            return response;
        },

        async validatePromo(code: string, total: number, itemIds?: string[]) {
            return await discountsApi.validatePromoCode(code, total, itemIds);
        },

        reset(): void {
            set({ ...defaultState });
        }
    };
}

export const discountsStore = createDiscountsStore();
