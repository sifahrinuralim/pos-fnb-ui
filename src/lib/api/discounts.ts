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

/** Matches backend PromoValidateResponse (POST /api/v1/discounts/validate-promo) */
export interface PromoValidateResponse {
	is_valid: boolean;
	discount_id: string | null;
	discount_name: string | null;
	discount_type: DiscountType | null;
	discount_value: string | null;
	calculated_discount: string | null;
	reason: string | null;
}

/** @deprecated Renamed to PromoValidateResponse to match the backend schema. */
export type DiscountValidationResult = PromoValidateResponse;

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

/** GET /api/v1/discounts/{discount_id} */
export async function getDiscount(id: string): Promise<ApiResponse<DiscountResponse>> {
	return apiGet<DiscountResponse>(`/discounts/${id}`);
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

/** POST /api/v1/discounts/validate-promo — validate a promo code against an order total */
export async function validatePromoCode(
	promoCode: string,
	orderTotal: number,
	itemIds?: string[]
): Promise<ApiResponse<PromoValidateResponse>> {
	return apiPost<PromoValidateResponse>('/discounts/validate-promo', {
		promo_code: promoCode,
		order_total: orderTotal,
		item_ids: itemIds
	});
}
