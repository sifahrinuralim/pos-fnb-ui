import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types (aligned with Swagger /openapi.json)
// ──────────────────────────────────────────────

export interface CategoryCreate {
	name: string;
	description?: string | null;
	is_active?: boolean;
}

export interface CategoryUpdate {
	name?: string | null;
	description?: string | null;
	is_active?: boolean | null;
}

export interface CategoryResponse {
	id: string;
	name: string;
	description: string | null;
	is_active: boolean;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** POST /api/v1/categories */
export async function createCategory(payload: CategoryCreate): Promise<ApiResponse<CategoryResponse>> {
	return apiPost<CategoryResponse>('/categories', payload);
}

/** GET /api/v1/categories?skip=&limit= → data: CategoryResponse[] */
export async function listCategories(skip?: number, limit?: number): Promise<ApiResponse<CategoryResponse[]>> {
	return apiGet<CategoryResponse[]>('/categories', { skip, limit });
}

/** GET /api/v1/categories/{id} */
export async function getCategory(id: string): Promise<ApiResponse<CategoryResponse>> {
	return apiGet<CategoryResponse>(`/categories/${id}`);
}

/** PATCH /api/v1/categories/{id} */
export async function updateCategory(id: string, payload: CategoryUpdate): Promise<ApiResponse<CategoryResponse>> {
	return apiPatch<CategoryResponse>(`/categories/${id}`, payload);
}

/** DELETE /api/v1/categories/{id} */
export async function deleteCategory(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/categories/${id}`);
}
