import { writable } from 'svelte/store';
import * as orderApi from '$lib/api/orders';
import type {
	Order,
	OrderListItem,
	OrderCreatePayload,
	OrderCreateResponse,
	OrderStatus
} from '$lib/api/orders';

interface OrderState {
	activeOrders: OrderListItem[];
	currentOrder: Order | null;
	loading: boolean;
	error: string | null;
}

const initialState: OrderState = {
	activeOrders: [],
	currentOrder: null,
	loading: false,
	error: null
};

function createOrderStore() {
	const { subscribe, set, update } = writable<OrderState>(initialState);

	return {
		subscribe,

		/** GET /orders — refresh daftar order aktif (pending & in_kitchen) */
		async loadActiveOrders(limit = 50): Promise<void> {
			update((s) => ({ ...s, loading: true, error: null }));
			try {
				const res = await orderApi.listActiveOrders(limit);
				update((s) => ({
					...s,
					activeOrders: res.success && Array.isArray(res.data) ? res.data : [],
					loading: false,
					error: res.success ? null : (res.message ?? 'Gagal memuat daftar order.')
				}));
			} catch (err: any) {
				update((s) => ({ ...s, loading: false, error: err?.message ?? 'Gagal memuat daftar order.' }));
			}
		},

		/**
		 * POST /orders — buat order baru.
		 * currentOrder sengaja dikosongkan; halaman pembayaran akan fetch detail
		 * lengkap via getOrder() agar semua field (items, total, meja) terisi.
		 */
		async createOrder(payload: OrderCreatePayload): Promise<OrderCreateResponse> {
			update((s) => ({ ...s, loading: true, error: null }));
			try {
				const res = await orderApi.createOrder(payload);
				if (!res.success) {
					const err = new Error(res.message ?? 'Gagal membuat order.');
					update((s) => ({ ...s, loading: false, error: err.message }));
					throw err;
				}
				update((s) => ({ ...s, currentOrder: null, loading: false, error: null }));
				return res.data;
			} catch (err: any) {
				update((s) => ({ ...s, loading: false, error: err?.message ?? 'Gagal membuat order.' }));
				throw err;
			}
		},

		/** GET /orders/{id} — muat detail order ke currentOrder */
		async getOrder(id: string): Promise<void> {
			update((s) => ({ ...s, loading: true, error: null }));
			try {
				const res = await orderApi.getOrder(id);
				update((s) => ({
					...s,
					currentOrder: res.success ? res.data : null,
					loading: false,
					error: res.success ? null : (res.message ?? 'Order tidak ditemukan.')
				}));
			} catch (err: any) {
				update((s) => ({ ...s, loading: false, error: err?.message ?? 'Gagal memuat detail order.' }));
			}
		},

		/**
		 * PATCH /orders/{id}/status — perbarui status. Backend hanya mengembalikan
		 * { id, status }, jadi object yang sudah ada di-update in-place (tanpa
		 * menggantikan data detail yang lebih kaya).
		 */
		async updateStatus(id: string, status: OrderStatus): Promise<void> {
			update((s) => ({ ...s, loading: true, error: null }));
			try {
				const res = await orderApi.updateOrderStatus(id, status);
				if (!res.success) {
					const err = new Error(res.message ?? 'Gagal memperbarui status order.');
					update((s) => ({ ...s, loading: false, error: err.message }));
					throw err;
				}
				const newStatus = res.data.status;
				update((s) => ({
					...s,
					loading: false,
					error: null,
					activeOrders: s.activeOrders.map((o) =>
						o.id === id ? { ...o, status: newStatus } : o
					),
					currentOrder:
						s.currentOrder && s.currentOrder.id === id
							? { ...s.currentOrder, status: newStatus }
							: s.currentOrder
				}));
			} catch (err: any) {
				update((s) => ({ ...s, loading: false, error: err?.message ?? 'Gagal memperbarui status order.' }));
				throw err;
			}
		},

		clearCurrentOrder(): void {
			update((s) => ({ ...s, currentOrder: null }));
		},

		reset(): void {
			set({ ...initialState });
		}
	};
}

export const orderStore = createOrderStore();
