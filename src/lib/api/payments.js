import { apiGet, apiPost } from '$lib/services/api';

/**
 * @typedef {'cash' | 'qris' | 'card'} PaymentMethod
 *
 * @typedef {Object} PaymentRequest
 * @property {string} order_id - ID pesanan yang dibayar
 * @property {number} amount - Nominal pembayaran
 * @property {PaymentMethod} method - Metode pembayaran (cash | qris | card)
 * @property {string} [reference_id] - Referensi transaksi eksternal (opsional)
 *
 * @typedef {Object} Payment
 * @property {string} id - ID unik pembayaran
 * @property {string} order_id - ID pesanan terkait
 * @property {number} amount - Nominal yang dibayar
 * @property {PaymentMethod} method - Metode pembayaran
 * @property {'pending' | 'completed' | 'failed'} status - Status pembayaran
 * @property {string | null} reference_id - Referensi dari penyedia pembayaran
 * @property {string} created_at - Waktu pembayaran dibuat (ISO 8601)
 */

/**
 * POST /api/v1/payments
 *
 * Membuat pembayaran baru untuk sebuah order.
 *
 * @param {PaymentRequest} data - Payload pembayaran
 * @returns {Promise<import('$lib/services/api').ApiResponse<Payment>>}
 */
export function createPayment(data) {
	return apiPost('/payments', data);
}

/**
 * GET /api/v1/payments?skip=&limit=
 *
 * Mengambil daftar pembayaran terbaru (dengan pagination).
 *
 * @param {number} [skip] - Jumlah data yang dilewati (default 0)
 * @param {number} [limit] - Batas jumlah data (default 20)
 * @returns {Promise<import('$lib/services/api').ApiResponse<Payment[]>>}
 */
export function listRecentPayments(skip = 0, limit = 20) {
	return apiGet('/payments', { skip, limit });
}

/**
 * GET /api/v1/payments/order/{order_id}
 *
 * Mengambil seluruh pembayaran milik sebuah order.
 *
 * @param {string} orderId - ID order
 * @returns {Promise<import('$lib/services/api').ApiResponse<Payment[]>>}
 */
export function listPaymentsByOrder(orderId) {
	return apiGet(`/payments/order/${orderId}`);
}
