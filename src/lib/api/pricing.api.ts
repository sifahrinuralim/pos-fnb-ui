import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// Price Book Interface
export interface PriceBook {
    id: number;
    name: string;
    description?: string;
    order_type: string;
    is_default: boolean;
    is_active: boolean;
}

// Product Price Interface
export interface ProductPrice {
    id: number;
    price_book_id: number;
    menu_item_id: number;
    variant_id?: number | null;
    override_price: number;
}

/** Price Book API */

export async function listPriceBooks(): Promise<ApiResponse<PriceBook[]>> {
    return apiGet<PriceBook[]>('/pricing/price-books');
}

export async function createPriceBook(data: Partial<PriceBook>): Promise<ApiResponse<PriceBook>> {
    return apiPost<PriceBook>('/pricing/price-books', data);
}

export async function getPriceBook(id: number): Promise<ApiResponse<PriceBook>> {
    return apiGet<PriceBook>(`/pricing/price-books/${id}`);
}

export async function updatePriceBook(id: number, data: Partial<PriceBook>): Promise<ApiResponse<PriceBook>> {
    return apiPatch<PriceBook>(`/pricing/price-books/${id}`, data);
}

export async function deletePriceBook(id: number): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/pricing/price-books/${id}`);
}

/** Product Price API */

export async function listProductPrices(priceBookId: number): Promise<ApiResponse<ProductPrice[]>> {
    return apiGet<ProductPrice[]>(`/pricing/price-books/${priceBookId}/product-prices`);
}

export async function createProductPrice(data: Omit<ProductPrice, 'id'>): Promise<ApiResponse<ProductPrice>> {
    return apiPost<ProductPrice>('/pricing/product-prices', data);
}

export async function updateProductPrice(id: number, data: Partial<ProductPrice>): Promise<ApiResponse<ProductPrice>> {
    return apiPatch<ProductPrice>(`/pricing/product-prices/${id}`, data);
}

export async function deleteProductPrice(id: number): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/pricing/product-prices/${id}`);
}

/** 
 * Utility to find price for a specific item in a price book 
 * Can be used in order page context
 */
export async function getEffectivePrice(priceBookId: number, menuItemId: number, variantId?: number | null): Promise<number | null> {
    const res = await listProductPrices(priceBookId);
    if (!res.success) return null;
    
    const price = res.data.find(p => 
        p.menu_item_id === menuItemId && 
        (variantId ? p.variant_id === variantId : !p.variant_id)
    );
    
    return price ? price.override_price : null;
}

