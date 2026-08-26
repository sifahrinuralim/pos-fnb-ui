import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types (aligned with Swagger /openapi.json)
// ──────────────────────────────────────────────

export interface MenuItemVariantCreate {
	name: string;
	price_adjustment: string;
	is_active?: boolean;
}

export interface MenuItemVariantResponse {
	id: string;
	name: string;
	price_adjustment: string;
	is_active: boolean;
}

export interface MenuItemAddonIn {
	addon_id: string;
	is_required?: boolean;
}

export interface AddonResponse {
	id: string;
	name: string;
	description: string | null;
	price: string;
}

export interface MenuItemAddonOut {
	addon: AddonResponse;
	is_required: boolean;
}

export interface MenuItemCreate {
	category_id: string;
	name: string;
	description?: string | null;
	base_price: number | string;
	image_url?: string | null;
	is_available?: boolean;
	is_active?: boolean;
	variants?: MenuItemVariantCreate[] | null;
	addons?: MenuItemAddonIn[] | null;
}

export interface MenuItemUpdate {
	category_id?: string | null;
	name?: string | null;
	description?: string | null;
	base_price?: number | string | null;
	image_url?: string | null;
	is_available?: boolean | null;
	is_active?: boolean | null;
}

export interface MenuItemResponse {
	id: string;
	category_id: string;
	name: string;
	description: string | null;
	base_price: string;
	image_url: string | null;
	is_available: boolean;
	is_active: boolean;
	variants: MenuItemVariantResponse[];
	addons: MenuItemAddonOut[];
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** POST /api/v1/menu-items */
export async function createMenuItem(payload: MenuItemCreate): Promise<ApiResponse<MenuItemResponse>> {
	return apiPost<MenuItemResponse>('/menu-items', payload);
}

/** GET /api/v1/menu-items?category_id=&skip=&limit= → data: MenuItemResponse[] */
export async function listMenuItems(
	categoryId?: string | null,
	skip?: number,
	limit?: number
): Promise<ApiResponse<MenuItemResponse[]>> {
	const params: Record<string, unknown> = { skip, limit };
	if (categoryId) params.category_id = categoryId;
	return apiGet<MenuItemResponse[]>('/menu-items', params);
}

/** GET /api/v1/menu-items/{menu_item_id} */
export async function getMenuItem(id: string): Promise<ApiResponse<MenuItemResponse>> {
	return apiGet<MenuItemResponse>(`/menu-items/${id}`);
}

/** PATCH /api/v1/menu-items/{menu_item_id} */
export async function updateMenuItem(
	id: string,
	payload: MenuItemUpdate
): Promise<ApiResponse<MenuItemResponse>> {
	return apiPatch<MenuItemResponse>(`/menu-items/${id}`, payload);
}

/** DELETE /api/v1/menu-items/{menu_item_id} */
export async function deleteMenuItem(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/menu-items/${id}`);
}
