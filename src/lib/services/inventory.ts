import { apiGet, apiPost, apiPatch } from '$lib/services/api';

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

export const createIngredient = (data: any) => apiPost('/inventory/ingredients', data);
export const listIngredients = (skip: number = 0, limit: number = 50) => apiGet<Ingredient[]>('/inventory/ingredients', { skip, limit });
export const getIngredient = (id: string) => apiGet<Ingredient>(`/inventory/ingredients/${id}`);
export const updateIngredient = (id: string, data: any) => apiPatch(`/inventory/ingredients/${id}`, data);

export const createInventory = (data: any) => apiPost('/inventory/stocks', data);
export const listInventory = (skip: number = 0, limit: number = 50) => apiGet<InventoryItem[]>('/inventory/stocks', { skip, limit });
export const getInventory = (id: string) => apiGet<InventoryItem>(`/inventory/stocks/${id}`);
export const updateInventory = (id: string, data: any) => apiPatch(`/inventory/stocks/${id}`, data);
export const listLowStock = () => apiGet<InventoryItem[]>('/inventory/stocks/low');
