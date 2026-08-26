import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

export interface Category {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
}

export async function createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
    return await apiPost<Category>('/v1/categories', data);
}

export async function listCategories(skip: number = 0, limit: number = 20): Promise<ApiResponse<{ items: Category[]; total: number }>> {
    return await apiGet<{ items: Category[]; total: number }>('/v1/categories', { skip, limit });
}

export async function getCategory(id: string): Promise<ApiResponse<Category>> {
    return await apiGet<Category>(`/v1/categories/${id}`);
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<ApiResponse<Category>> {
    return await apiPatch<Category>(`/v1/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
    return await apiDelete<void>(`/v1/categories/${id}`);
}
