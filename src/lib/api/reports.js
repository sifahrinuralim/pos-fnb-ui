import { apiGet } from '$lib/services/api';

/**
 * GET /api/v1/reports/sales-summary
 *
 * Ringkasan penjualan (gross, diskon, net, jumlah transaksi,
 * rata-rata nilai pesanan, dan rincian metode pembayaran)
 * untuk rentang tanggal tertentu.
 *
 * @param {string} startDate - Tanggal mulai (format YYYY-MM-DD)
 * @param {string} endDate - Tanggal akhir (format YYYY-MM-DD)
 * @returns {Promise<import('$lib/services/api').ApiResponse<object>>}
 */
export function getSalesSummary(startDate, endDate) {
	return apiGet('/reports/sales-summary', {
		start_date: startDate,
		end_date: endDate
	});
}

/**
 * GET /api/v1/reports/best-selling
 *
 * Daftar menu terlaris berdasarkan jumlah terjual dan total pendapatan.
 *
 * @param {number} limit - Jumlah item teratas yang diminta
 * @param {string} startDate - Tanggal mulai (format YYYY-MM-DD)
 * @param {string} endDate - Tanggal akhir (format YYYY-MM-DD)
 * @returns {Promise<import('$lib/services/api').ApiResponse<object>>}
 */
export function getBestSelling(limit, startDate, endDate) {
	return apiGet('/reports/best-selling', {
		limit,
		start_date: startDate,
		end_date: endDate
	});
}

/**
 * GET /api/v1/reports/shift-settlement
 *
 * Rekap settlement shift per kasir pada tanggal tertentu.
 *
 * @param {string|null} userId - ID kasir (null / kosong = semua kasir)
 * @param {string} date - Tanggal (format YYYY-MM-DD)
 * @returns {Promise<import('$lib/services/api').ApiResponse<object>>}
 */
export function getShiftSettlement(userId, date) {
	const params = { date };
	if (userId) {
		params.user_id = userId;
	}
	return apiGet('/reports/shift-settlement', params);
}
