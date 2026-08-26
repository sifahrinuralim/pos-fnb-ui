import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface TaxConfig {
	id: number;
	name: string;
	rate: number;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface StoreSetting {
	id: number;
	store_name: string;
	address: string | null;
	phone: string | null;
	email: string | null;
	logo_url: string | null;
	receipt_footer: string | null;
	tax_invoice_number: string | null;
	created_at?: string;
	updated_at?: string;
}

// ──────────────────────────────────────────────
// Tax Configuration API
// ──────────────────────────────────────────────

/** GET /api/v1/settings/tax → data: TaxConfig[] */
export async function listTaxConfigs(): Promise<ApiResponse<TaxConfig[]>> {
	return apiGet<TaxConfig[]>('/settings/tax');
}

/** GET /api/v1/settings/tax/active → data: TaxConfig */
export async function getActiveTaxConfig(): Promise<ApiResponse<TaxConfig>> {
	return apiGet<TaxConfig>('/settings/tax/active');
}

/** POST /api/v1/settings/tax */
export async function createTaxConfig(data: Partial<TaxConfig>): Promise<ApiResponse<TaxConfig>> {
	return apiPost<TaxConfig>('/settings/tax', data);
}

/** PATCH /api/v1/settings/tax/{tax_config_id} */
export async function updateTaxConfig(
	id: number,
	data: Partial<TaxConfig>
): Promise<ApiResponse<TaxConfig>> {
	return apiPatch<TaxConfig>(`/settings/tax/${id}`, data);
}

/** DELETE /api/v1/settings/tax/{tax_config_id} */
export async function deleteTaxConfig(id: number): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/settings/tax/${id}`);
}

// ──────────────────────────────────────────────
// Store Setting API
// ──────────────────────────────────────────────

/** GET /api/v1/settings/store/active → data: StoreSetting */
export async function getActiveStoreSetting(): Promise<ApiResponse<StoreSetting>> {
	return apiGet<StoreSetting>('/settings/store/active');
}

/** PATCH /api/v1/settings/store/{store_setting_id} */
export async function updateStoreSetting(
	id: number,
	data: Partial<StoreSetting>
): Promise<ApiResponse<StoreSetting>> {
	return apiPatch<StoreSetting>(`/settings/store/${id}`, data);
}
