import { apiGet, apiPost, apiPatch, apiDelete } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types (aligned with backend /api/v1/tax-configs & /api/v1/store-settings)
// ──────────────────────────────────────────────

/**
 * @typedef {Object} TaxConfig
 * @property {number} id - ID unik konfigurasi pajak
 * @property {string} name - Nama konfigurasi pajak
 * @property {number} service_charge_rate - Persentase service charge (contoh: 5 → 5%)
 * @property {number} ppn_rate - Persentase PPN (contoh: 11 → 11%)
 * @property {boolean} is_active - Status aktif konfigurasi (hanya satu yang aktif)
 * @property {string} [created_at] - Waktu dibuat (ISO 8601)
 * @property {string} [updated_at] - Waktu diperbarui (ISO 8601)
 */

/**
 * @typedef {Object} StoreSetting
 * @property {number} id - ID unik pengaturan outlet
 * @property {string} store_name - Nama outlet
 * @property {string | null} address - Alamat outlet
 * @property {string | null} phone - Nomor telepon outlet
 * @property {string | null} email - Alamat email outlet
 * @property {string | null} logo_url - URL logo outlet
 * @property {string | null} receipt_footer - Footer / teks tambahan pada struk
 * @property {string | null} tax_invoice_number - Nomor faktur pajak outlet
 * @property {string} [created_at] - Waktu dibuat (ISO 8601)
 * @property {string} [updated_at] - Waktu diperbarui (ISO 8601)
 */

// ──────────────────────────────────────────────
// Tax Configuration API
// ──────────────────────────────────────────────

/**
 * GET /api/v1/tax-configs
 *
 * Mengambil daftar seluruh konfigurasi pajak.
 *
 * @returns {Promise<import('$lib/services/api').ApiResponse<TaxConfig[]>>}
 */
export function listTaxConfigs() {
	return apiGet('/tax-configs');
}

/**
 * GET /api/v1/tax-configs/active
 *
 * Mengambil konfigurasi pajak yang sedang aktif (dipakai untuk perhitungan order).
 *
 * @returns {Promise<import('$lib/services/api').ApiResponse<TaxConfig>>}
 */
export function getActiveTaxConfig() {
	return apiGet('/tax-configs/active');
}

/**
 * POST /api/v1/tax-configs
 *
 * Membuat konfigurasi pajak baru.
 *
 * @param {Partial<TaxConfig>} data - Payload konfigurasi pajak
 * @returns {Promise<import('$lib/services/api').ApiResponse<TaxConfig>>}
 */
export function createTaxConfig(data) {
	return apiPost('/tax-configs', data);
}

/**
 * PATCH /api/v1/tax-configs/{config_id}
 *
 * Memperbarui konfigurasi pajak.
 *
 * @param {number} configId - ID konfigurasi pajak
 * @param {Partial<TaxConfig>} data - Payload pembaruan
 * @returns {Promise<import('$lib/services/api').ApiResponse<TaxConfig>>}
 */
export function updateTaxConfig(configId, data) {
	return apiPatch(`/tax-configs/${configId}`, data);
}

/**
 * DELETE /api/v1/tax-configs/{config_id}
 *
 * Menghapus konfigurasi pajak.
 *
 * @param {number} configId - ID konfigurasi pajak
 * @returns {Promise<import('$lib/services/api').ApiResponse<Record<string, never>>>}
 */
export function deleteTaxConfig(configId) {
	return apiDelete(`/tax-configs/${configId}`);
}

// ──────────────────────────────────────────────
// Store Setting API
// ──────────────────────────────────────────────

/**
 * GET /api/v1/store-settings
 *
 * Mengambil daftar seluruh pengaturan outlet.
 *
 * @returns {Promise<import('$lib/services/api').ApiResponse<StoreSetting[]>>}
 */
export function listStoreSettings() {
	return apiGet('/store-settings');
}

/**
 * POST /api/v1/store-settings
 *
 * Membuat pengaturan outlet baru.
 *
 * @param {Partial<StoreSetting>} data - Payload pengaturan outlet
 * @returns {Promise<import('$lib/services/api').ApiResponse<StoreSetting>>}
 */
export function createStoreSetting(data) {
	return apiPost('/store-settings', data);
}

/**
 * GET /api/v1/store-settings/active
 *
 * Mengambil pengaturan outlet yang sedang aktif.
 *
 * @returns {Promise<import('$lib/services/api').ApiResponse<StoreSetting>>}
 */
export function getActiveStoreSetting() {
	return apiGet('/store-settings/active');
}

/**
 * PATCH /api/v1/store-settings/{setting_id}
 *
 * Memperbarui pengaturan outlet.
 *
 * @param {number} settingId - ID pengaturan outlet
 * @param {Partial<StoreSetting>} data - Payload pembaruan
 * @returns {Promise<import('$lib/services/api').ApiResponse<StoreSetting>>}
 */
export function updateStoreSetting(settingId, data) {
	return apiPatch(`/store-settings/${settingId}`, data);
}

/**
 * DELETE /api/v1/store-settings/{setting_id}
 *
 * Menghapus pengaturan outlet.
 *
 * @param {number} settingId - ID pengaturan outlet
 * @returns {Promise<import('$lib/services/api').ApiResponse<Record<string, never>>>}
 */
export function deleteStoreSetting(settingId) {
	return apiDelete(`/store-settings/${settingId}`);
}
