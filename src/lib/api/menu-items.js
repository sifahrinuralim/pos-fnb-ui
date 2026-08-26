import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

export interface MenuItem {
    id: string;
    category_id: string;
    name: string;
    description: string;
    base_price: number;
    image_url: string;
    is_available: boolean;
    is_active: boolean;
    variants: { name: string; price_adjustment: number; is_active: boolean }[];
    addons: { addon_id: string; is_required: boolean }[];
}

export async function createMenuItem(data: Partial<MenuItem>) {
    return await apiPost<MenuItem>('/v1/menu-items', data);
}

export async function listMenuItems(categoryId?: string, skip: number = 0, limit: number = 20) {
    return await apiGet<{ items: MenuItem[]; total: number }>('/v1/menu-items', {
        category_id: categoryId,
        skip,
        limit
    });
}

export async function getMenuItem(id: string) {
    return await apiGet<MenuItem>(`/v1/menu-items/${id}`);
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
    return await apiPatch<MenuItem>(`/v1/menu-items/${id}`, data);
}

export async function deleteMenuItem(id: string) {
    return await apiDelete<void>(`/v1/menu-items/${id}`);
}

export async function listCategories() {
    return await apiGet<{ id: string; name: string }[]>('/v1/categories');
}
