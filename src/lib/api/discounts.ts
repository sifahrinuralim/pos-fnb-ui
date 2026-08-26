import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed';
export type DiscountScope = 'order' | 'item';

export interface DiscountTarget {
	category_id?: string | null;
	menu_item_id?: string | null;
}

export interface DiscountCreate {
	name: string;
	code: string;
	discount_type: DiscountType;
	value: string;
	min_order_amount: number | null;
	max_discount_amount: number | null;
	applies_to: DiscountScope;
	start_date?: string | null;
	end_date?: string | null;
	usage_limit?: number | null;
	is_active?: boolean;
	targets?: DiscountTarget[] | null;
}

export interface DiscountUpdate {
	name?: string | null;
	code?: string | null;
	discount_type?: DiscountType | null;
	value?: string | null;
	min_order_amount?: number | null;
	max_discount_amount?: number | null;
	applies_to?: DiscountScope | null;
	start_date?: string | null;
	end_date?: string | null;
	usage_limit?: number | null;
	is_active?: boolean | null;
	targets?: DiscountTarget[] | null;
}

export interface DiscountResponse {
	id: string;
	name: string;
	code: string;
	discount_type: DiscountType;
	value: string;
	min_order_amount: number | null;
	max_discount_amount: number | null;
	applies_to: DiscountScope;
	start_date: string | null;
	end_date: string | null;
	usage_limit: number | null;
	is_active: boolean;
	targets: DiscountTarget[] | null;
	created_at?: string;
	updated_at?: string;
}

export interface DiscountValidationResult {
	valid: boolean;
	discount: DiscountResponse | null;
	discount_amount: number;
	message?: string;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** GET /api/v1/discounts?is_active= → data: DiscountResponse[] */
export async function listDiscounts(activeOnly?: boolean): Promise<ApiResponse<DiscountResponse[]>> {
	const params: Record<string, unknown> = {};
	if (activeOnly !== undefined) params.is_active = activeOnly;
	return apiGet<DiscountResponse[]>('/discounts', params);
}

/** POST /api/v1/discounts */
export async function createDiscount(payload: DiscountCreate): Promise<ApiResponse<DiscountResponse>> {
	return apiPost<DiscountResponse>('/discounts', payload);
}

/** PATCH /api/v1/discounts/{discount_id} */
export async function updateDiscount(
	id: string,
	payload: DiscountUpdate
): Promise<ApiResponse<DiscountResponse>> {
	return apiPatch<DiscountResponse>(`/discounts/${id}`, payload);
}

/** DELETE /api/v1/discounts/{discount_id} */
export async function deleteDiscount(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/discounts/${id}`);
}

/** POST /api/v1/discounts/validate — validate a promo code against an order total */
export async function validatePromoCode(
	code: string,
	total: number,
	itemIds?: string[]
): Promise<ApiResponse<DiscountValidationResult>> {
	return apiPost<DiscountValidationResult>('/discounts/validate', {
		code,
		total,
		item_ids: itemIds
	});
}
