import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Price Book (PriceBookCreate / PriceBookResponse / PriceBookUpdate)
// ──────────────────────────────────────────────

export interface PriceBook {
	id: string; // uuid
	name: string;
	description: string | null;
	order_type: string | null;
	is_default: boolean;
	is_active: boolean;
}

export interface PriceBookCreate {
	name: string;
	description?: string | null;
	order_type?: string | null;
	is_default?: boolean;
	is_active?: boolean;
}

export type PriceBookUpdate = Partial<Omit<PriceBookCreate, 'name'>>;

// ──────────────────────────────────────────────
// Product Price (ProductPriceCreate / ProductPriceResponse / ProductPriceUpdate)
// ──────────────────────────────────────────────

export interface ProductPrice {
	id: string; // uuid
	price_book_id: string; // uuid
	menu_item_id: string | null; // uuid
	variant_id: string | null; // uuid
	override_price: string | number;
}

export interface ProductPriceCreate {
	price_book_id: string; // uuid — required
	menu_item_id?: string | null;
	variant_id?: string | null;
	override_price: string | number;
}

export interface ProductPriceUpdate {
	override_price: string | number;
}

// ──────────────────────────────────────────────
// Modifier Pricing Rule (ModifierPricingRuleCreate / Response / Update)
// ──────────────────────────────────────────────

export interface ModifierPricingRule {
	id: string; // uuid
	menu_item_id: string; // uuid
	addon_id: string | null; // uuid
	free_quantity: number;
	extra_price: string | null;
	is_active: boolean;
}

export interface ModifierPricingRuleCreate {
	menu_item_id: string; // uuid — required
	addon_id?: string | null;
	free_quantity?: number;
	extra_price?: string | number | null;
	is_active?: boolean;
}

export interface ModifierPricingRuleUpdate {
	free_quantity?: number | null;
	extra_price?: string | number | null;
	is_active?: boolean | null;
}


// ──────────────────────────────────────────────
// Price Book API
// ──────────────────────────────────────────────

/** GET /api/v1/pricing/price-books */
export async function listPriceBooks(): Promise<ApiResponse<PriceBook[]>> {
	return apiGet<PriceBook[]>('/pricing/price-books');
}

/** POST /api/v1/pricing/price-books */
export async function createPriceBook(data: PriceBookCreate): Promise<ApiResponse<PriceBook>> {
	return apiPost<PriceBook>('/pricing/price-books', data);
}

/** GET /api/v1/pricing/price-books/{price_book_id} */
export async function getPriceBook(id: string): Promise<ApiResponse<PriceBook>> {
	return apiGet<PriceBook>(`/pricing/price-books/${id}`);
}

/** PATCH /api/v1/pricing/price-books/{price_book_id} */
export async function updatePriceBook(id: string, data: PriceBookUpdate): Promise<ApiResponse<PriceBook>> {
	return apiPatch<PriceBook>(`/pricing/price-books/${id}`, data);
}

/** DELETE /api/v1/pricing/price-books/{price_book_id} */
export async function deletePriceBook(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/pricing/price-books/${id}`);
}

// ──────────────────────────────────────────────
// Product Price API
// ──────────────────────────────────────────────

/** GET /api/v1/pricing/price-books/{price_book_id}/product-prices */
export async function listProductPrices(priceBookId: string): Promise<ApiResponse<ProductPrice[]>> {
	return apiGet<ProductPrice[]>(`/pricing/price-books/${priceBookId}/product-prices`);
}

/** POST /api/v1/pricing/product-prices */
export async function createProductPrice(data: ProductPriceCreate): Promise<ApiResponse<ProductPrice>> {
	return apiPost<ProductPrice>('/pricing/product-prices', data);
}

/** PATCH /api/v1/pricing/product-prices/{product_price_id} */
export async function updateProductPrice(id: string, data: ProductPriceUpdate): Promise<ApiResponse<ProductPrice>> {
	return apiPatch<ProductPrice>(`/pricing/product-prices/${id}`, data);
}

/** DELETE /api/v1/pricing/product-prices/{product_price_id} */
export async function deleteProductPrice(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/pricing/product-prices/${id}`);
}

// ──────────────────────────────────────────────
// Modifier Pricing Rule API
// ──────────────────────────────────────────────

/** GET /api/v1/pricing/modifier-rules */
export async function listModifierRules(): Promise<ApiResponse<ModifierPricingRule[]>> {
	return apiGet<ModifierPricingRule[]>('/pricing/modifier-rules');
}

/** POST /api/v1/pricing/modifier-rules */
export async function createModifierRule(
	payload: ModifierPricingRuleCreate
): Promise<ApiResponse<ModifierPricingRule>> {
	return apiPost<ModifierPricingRule>('/pricing/modifier-rules', payload);
}

/** PATCH /api/v1/pricing/modifier-rules/{rule_id} */
export async function updateModifierRule(
	id: string,
	payload: ModifierPricingRuleUpdate
): Promise<ApiResponse<ModifierPricingRule>> {
	return apiPatch<ModifierPricingRule>(`/pricing/modifier-rules/${id}`, payload);
}

/** DELETE /api/v1/pricing/modifier-rules/{rule_id} */
export async function deleteModifierRule(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/pricing/modifier-rules/${id}`);
}

// ──────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────

/**
 * Cari harga override sebuah menu item (opsional variant) di dalam sebuah price book.
 *
 * @param priceBookId - ID price book (uuid)
 * @param menuItemId - ID menu item (uuid)
 * @param variantId - ID variant menu item (uuid, opsional)
 */
export async function getEffectivePrice(
	priceBookId: string,
	menuItemId: string,
	variantId?: string | null
): Promise<string | null> {
	const res = await listProductPrices(priceBookId);
	if (!res.success) return null;

	const price = res.data.find(
		(p) => p.menu_item_id === menuItemId && (variantId ? p.variant_id === variantId : !p.variant_id)
	);

	return price ? String(price.override_price) : null;
}

