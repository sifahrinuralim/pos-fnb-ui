import { writable } from 'svelte/store';
import * as inventoryService from '$lib/services/inventory';

interface InventoryStore {
    ingredients: inventoryService.Ingredient[];
    inventory: inventoryService.InventoryItem[];
    lowStockItems: inventoryService.InventoryItem[];
    loading: boolean;
}

const initialState: InventoryStore = {
    ingredients: [],
    inventory: [],
    lowStockItems: [],
    loading: false
};

function createInventoryStore() {
    const { subscribe, set, update } = writable<InventoryStore>(initialState);

    return {
        subscribe,
        loadIngredients: async () => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await inventoryService.listIngredients();
                update(s => ({ ...s, ingredients: res.data, loading: false }));
            } catch {
                update(s => ({ ...s, loading: false }));
            }
        },
        loadInventory: async () => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await inventoryService.listInventory();
                update(s => ({ ...s, inventory: res.data, loading: false }));
            } catch {
                update(s => ({ ...s, loading: false }));
            }
        },
        loadLowStock: async () => {
            update(s => ({ ...s, loading: true }));
            try {
                const res = await inventoryService.listLowStock();
                update(s => ({ ...s, lowStockItems: res.data, loading: false }));
            } catch {
                update(s => ({ ...s, loading: false }));
            }
        }
    };
}

export const inventoryStore = createInventoryStore();
