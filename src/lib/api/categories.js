import { apiGet, apiPost, apiPatch, apiDelete } from '$lib/services/api';

export interface Category {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
}

export async function createCategory(data: Partial<Category>) {
    return await apiPost<Category>('/v1/categories', data);
}

export async function listCategories(skip: number = 0, limit: number = 20) {
    return await apiGet<{ items: Category[]; total: number }>('/v1/categories', { skip, limit });
}

export async function getCategory(id: string) {
    return await apiGet<Category>(`/v1/categories/${id}`);
}

export async function updateCategory(id: string, data: Partial<Category>) {
    return await apiPatch<Category>(`/v1/categories/${id}`, data);
}

export async function deleteCategory(id: string) {
    return await apiDelete<void>(`/v1/categories/${id}`);
}
