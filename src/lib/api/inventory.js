import { apiGet, apiPost, apiPatch } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types (aligned with backend /api/v1/inventory/*)
// ──────────────────────────────────────────────

/**
 * @typedef {Object} Ingredient
 * @property {string} id - ID unik bahan baku
 * @property {string} name - Nama bahan baku
 * @property {string} unit - Satuan bahan baku (kg, pcs, liter, dll.)
 * @property {boolean} is_active - Status aktif bahan baku
 *
 * @typedef {Object} InventoryItem
 * @property {string} id - ID unik stok
 * @property {string} ingredient_id - ID bahan baku terkait
 * @property {string} ingredient_name - Nama bahan baku
 * @property {string} unit - Satuan stok
 * @property {number} stock_quantity - Jumlah stok saat ini
 * @property {number} minimum_stock - Batas stok minimum
 * @property {number} unit_price - Harga satuan bahan baku
 * @property {boolean} is_low_stock - Penanda stok di bawah / sama dengan minimum
 */

// ──────────────────────────────────────────────
// Ingredient API
// ──────────────────────────────────────────────

/**
 * POST /api/v1/inventory/ingredients
 * Membuat bahan baku baru.
 *
 * @param {{ name: string; unit: string; is_active?: boolean }} data - Payload bahan baku
 * @returns {Promise<import('$lib/services/api').ApiResponse<Ingredient>>}
 */
export function createIngredient(data) {
	return apiPost('/inventory/ingredients', data);
}

/**
 * GET /api/v1/inventory/ingredients?skip=&limit=
 * Mengambil daftar bahan baku dengan pagination.
 *
 * @param {number} [skip] - Jumlah data yang dilewati (default 0)
 * @param {number} [limit] - Batas jumlah data (default 50)
 * @returns {Promise<import('$lib/services/api').ApiResponse<Ingredient[]>>}
 */
export function listIngredients(skip = 0, limit = 50) {
	return apiGet('/inventory/ingredients', { skip, limit });
}

/**
 * GET /api/v1/inventory/ingredients/{ingredient_id}
 * Mengambil detail satu bahan baku.
 *
 * @param {string} id - ID bahan baku
 * @returns {Promise<import('$lib/services/api').ApiResponse<Ingredient>>}
 */
export function getIngredient(id) {
	return apiGet(`/inventory/ingredients/${id}`);
}

/**
 * PATCH /api/v1/inventory/ingredients/{ingredient_id}
 * Memperbarui bahan baku.
 *
 * @param {string} id - ID bahan baku
 * @param {Partial<{ name: string; unit: string; is_active: boolean }>} data - Payload pembaruan
 * @returns {Promise<import('$lib/services/api').ApiResponse<Ingredient>>}
 */
export function updateIngredient(id, data) {
	return apiPatch(`/inventory/ingredients/${id}`, data);
}

// ──────────────────────────────────────────────
// Stock / Inventory API
// ──────────────────────────────────────────────

/**
 * POST /api/v1/inventory/stocks
 * Membuat / menambahkan stok bahan baku.
 *
 * @param {{ ingredient_id: string; stock_quantity: number; minimum_stock: number; unit_price: number }} data - Payload stok
 * @returns {Promise<import('$lib/services/api').ApiResponse<InventoryItem>>}
 */
export function createInventory(data) {
	return apiPost('/inventory/stocks', data);
}

/**
 * GET /api/v1/inventory/stocks?skip=&limit=
 * Mengambil daftar stok dengan pagination.
 *
 * @param {number} [skip] - Jumlah data yang dilewati (default 0)
 * @param {number} [limit] - Batas jumlah data (default 50)
 * @returns {Promise<import('$lib/services/api').ApiResponse<InventoryItem[]>>}
 */
export function listInventory(skip = 0, limit = 50) {
	return apiGet('/inventory/stocks', { skip, limit });
}

/**
 * GET /api/v1/inventory/stocks/{inventory_id}
 * Mengambil detail satu stok.
 *
 * @param {string} id - ID stok
 * @returns {Promise<import('$lib/services/api').ApiResponse<InventoryItem>>}
 */
export function getInventory(id) {
	return apiGet(`/inventory/stocks/${id}`);
}

/**
 * PATCH /api/v1/inventory/stocks/{inventory_id}
 * Memperbarui stok bahan baku.
 *
 * @param {string} id - ID stok
 * @param {Partial<{ ingredient_id: string; stock_quantity: number; minimum_stock: number; unit_price: number }>} data - Payload pembaruan
 * @returns {Promise<import('$lib/services/api').ApiResponse<InventoryItem>>}
 */
export function updateInventory(id, data) {
	return apiPatch(`/inventory/stocks/${id}`, data);
}

/**
 * GET /api/v1/inventory/stocks/low
 * Mengambil daftar stok yang berada di bawah / sama dengan batas minimum.
 *
 * @returns {Promise<import('$lib/services/api').ApiResponse<InventoryItem[]>>}
 */
export function listLowStock() {
	return apiGet('/inventory/stocks/low');
}
