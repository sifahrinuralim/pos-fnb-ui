import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

export interface DiscountTarget {
    menu_item_id?: string | null;
    category_id?: string | null;
}

export interface DiscountCreate {
    name: string;
    code: string;
    discount_type: 'percentage' | 'fixed_amount';
    value: number | string;
    min_order_amount?: number | string | null;
    max_discount_amount?: number | string | null;
    applies_to: 'item' | 'order';
    start_date?: string | null;
    end_date?: string | null;
    usage_limit?: number | null;
    is_active?: boolean;
    targets?: DiscountTarget[] | null;
}

export interface DiscountUpdate extends Partial<DiscountCreate> {}

export interface DiscountResponse extends DiscountCreate {
    id: string;
    usage_count: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ValidatePromoResponse {
    discount_amount: number;
    final_total: number;
    discount_id: string;
    discount_name: string;
}

/** POST /api/v1/discounts */
export async function createDiscount(payload: DiscountCreate): Promise<ApiResponse<DiscountResponse>> {
    return apiPost<DiscountResponse>('/v1/discounts', payload);
}

/** GET /api/v1/discounts */
export async function listDiscounts(activeOnly?: boolean): Promise<ApiResponse<DiscountResponse[]>> {
    const params: Record<string, unknown> = {};
    if (activeOnly !== undefined) {
        params.active_only = activeOnly;
    }
    return apiGet<DiscountResponse[]>('/v1/discounts', params);
}

/** GET /api/v1/discounts/{discount_id} */
export async function getDiscount(id: string): Promise<ApiResponse<DiscountResponse>> {
    return apiGet<DiscountResponse>(`/v1/discounts/${id}`);
}

/** PATCH /api/v1/discounts/{discount_id} */
export async function updateDiscount(id: string, payload: DiscountUpdate): Promise<ApiResponse<DiscountResponse>> {
    return apiPatch<DiscountResponse>(`/v1/discounts/${id}`, payload);
}

/** DELETE /api/v1/discounts/{discount_id} */
export async function deleteDiscount(id: string): Promise<ApiResponse<Record<string, never>>> {
    return apiDelete<Record<string, never>>(`/v1/discounts/${id}`);
}

/** POST /api/v1/discounts/validate-promo */
export async function validatePromoCode(
    promoCode: string,
    orderTotal: number,
    itemIds?: string[]
): Promise<ApiResponse<ValidatePromoResponse>> {
    return apiPost<ValidatePromoResponse>('/v1/discounts/validate-promo', {
        promo_code: promoCode,
        order_total: orderTotal,
        item_ids: itemIds ?? []
    });
}
