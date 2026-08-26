import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface TaxConfig {
	id: number;
	name: string;
	rate: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface StoreSetting {
	id: number;
	store_name: string;
	address: string;
	phone: string;
	email: string;
	logo_url: string;
	receipt_footer: string;
	tax_invoice_number: string;
	is_active: boolean;
}

// ──────────────────────────────────────────────
// Tax Config API
// ──────────────────────────────────────────────

export async function listTaxConfigs(): Promise<ApiResponse<TaxConfig[]>> {
	return apiGet<TaxConfig[]>('/tax-configs');
}

export async function createTaxConfig(data: Omit<TaxConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<TaxConfig>> {
	return apiPost<TaxConfig>('/tax-configs', data);
}

export async function getActiveTaxConfig(): Promise<ApiResponse<TaxConfig>> {
	return apiGet<TaxConfig>('/tax-configs/active');
}

export async function updateTaxConfig(id: number, data: Partial<TaxConfig>): Promise<ApiResponse<TaxConfig>> {
	return apiPatch<TaxConfig>(`/tax-configs/${id}`, data);
}

export async function deleteTaxConfig(id: number): Promise<ApiResponse<void>> {
	return apiDelete<void>(`/tax-configs/${id}`);
}

// ──────────────────────────────────────────────
// Store Settings API
// ──────────────────────────────────────────────

export async function listStoreSettings(): Promise<ApiResponse<StoreSetting[]>> {
	return apiGet<StoreSetting[]>('/store-settings');
}

export async function createStoreSetting(data: Omit<StoreSetting, 'id'>): Promise<ApiResponse<StoreSetting>> {
	return apiPost<StoreSetting>('/store-settings', data);
}

export async function getActiveStoreSetting(): Promise<ApiResponse<StoreSetting>> {
	return apiGet<StoreSetting>('/store-settings/active');
}

export async function updateStoreSetting(id: number, data: Partial<StoreSetting>): Promise<ApiResponse<StoreSetting>> {
	return apiPatch<StoreSetting>(`/store-settings/${id}`, data);
}

export async function deleteStoreSetting(id: number): Promise<ApiResponse<void>> {
	return apiDelete<void>(`/store-settings/${id}`);
}
