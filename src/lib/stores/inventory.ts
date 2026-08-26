import { writable } from 'svelte/store';
import * as inventoryApi from '$lib/api/inventory';
import type { ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Ingredient {
	id: string;
	name: string;
	unit: string;
	is_active: boolean;
}

export interface InventoryItem {
	id: string;
	ingredient_id: string;
	ingredient_name: string;
	unit: string;
	stock_quantity: number;
	minimum_stock: number;
	unit_price: number;
	is_low_stock: boolean;
}

export interface IngredientCreate {
	name: string;
	unit: string;
	is_active?: boolean;
}

export type IngredientUpdate = Partial<IngredientCreate>;

export interface InventoryCreate {
	ingredient_id: string;
	stock_quantity: number;
	minimum_stock: number;
	unit_price: number;
}

export type InventoryUpdate = Partial<InventoryCreate>;

export interface InventoryState {
	ingredients: Ingredient[];
	inventory: InventoryItem[];
	lowStockItems: InventoryItem[];
	loading: boolean;
}

const defaultState: InventoryState = {
	ingredients: [],
	inventory: [],
	lowStockItems: [],
	loading: false
};

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

function createInventoryStore() {
	const { subscribe, set, update } = writable<InventoryState>({ ...defaultState });

	return {
		subscribe,

		async loadIngredients(skip = 0, limit = 100): Promise<void> {
			update((s) => ({ ...s, loading: true }));

			try {
				const res = await inventoryApi.listIngredients(skip, limit);
				if (res.success && Array.isArray(res.data)) {
					update((s) => ({ ...s, ingredients: res.data, loading: false }));
				} else {
					update((s) => ({ ...s, loading: false }));
				}
			} catch (error) {
				update((s) => ({ ...s, loading: false }));
				throw error;
			}
		},

		async loadInventory(skip = 0, limit = 100): Promise<void> {
			update((s) => ({ ...s, loading: true }));

			try {
				const res = await inventoryApi.listInventory(skip, limit);
				if (res.success && Array.isArray(res.data)) {
					update((s) => ({ ...s, inventory: res.data, loading: false }));
				} else {
					update((s) => ({ ...s, loading: false }));
				}
			} catch (error) {
				update((s) => ({ ...s, loading: false }));
				throw error;
			}
		},

		async loadLowStock(): Promise<void> {
			update((s) => ({ ...s, loading: true }));

			try {
				const res = await inventoryApi.listLowStock();
				if (res.success && Array.isArray(res.data)) {
					update((s) => ({ ...s, lowStockItems: res.data, loading: false }));
				} else {
					update((s) => ({ ...s, loading: false }));
				}
			} catch (error) {
				update((s) => ({ ...s, loading: false }));
				throw error;
			}
		},

		async createIngredient(payload: IngredientCreate): Promise<ApiResponse<Ingredient>> {
			const res = await inventoryApi.createIngredient(payload);
			if (res.success && res.data) {
				update((s) => ({ ...s, ingredients: [...s.ingredients, res.data!] }));
			}
			return res;
		},

		async updateIngredient(id: string, payload: IngredientUpdate): Promise<ApiResponse<Ingredient>> {
			const res = await inventoryApi.updateIngredient(id, payload);
			if (res.success && res.data) {
				update((s) => ({
					...s,
					ingredients: s.ingredients.map((ing) => (ing.id === id ? res.data! : ing))
				}));
			}
			return res;
		},

		async createInventory(payload: InventoryCreate): Promise<ApiResponse<InventoryItem>> {
			const res = await inventoryApi.createInventory(payload);
			if (res.success && res.data) {
				update((s) => ({ ...s, inventory: [...s.inventory, res.data!] }));
			}
			return res;
		},

		async updateInventory(id: string, payload: InventoryUpdate): Promise<ApiResponse<InventoryItem>> {
			const res = await inventoryApi.updateInventory(id, payload);
			if (res.success && res.data) {
				update((s) => ({
					...s,
					inventory: s.inventory.map((item) => (item.id === id ? res.data! : item))
				}));
			}
			return res;
		},

		reset(): void {
			set({ ...defaultState });
		}
	};
}

export const inventoryStore = createInventoryStore();
