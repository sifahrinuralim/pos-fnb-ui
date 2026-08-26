import { writable, get } from 'svelte/store';
import * as menuItemsApi from '$lib/api/menu-items.api';
import type { ApiResponse } from '$lib/services/api';
import type { MenuItemCreate, MenuItemUpdate, MenuItemResponse } from '$lib/api/menu-items.api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface MenuItemsState {
	items: MenuItemResponse[];
	loading: boolean;
	total: number;
	skip: number;
	limit: number;
	categoryId: string | null;
	search: string;
}

const defaultState: MenuItemsState = {
	items: [],
	loading: false,
	total: 0,
	skip: 0,
	limit: 20,
	categoryId: null,
	search: ''
};

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

function createMenuItemsStore() {
	const { subscribe, set, update } = writable<MenuItemsState>({ ...defaultState });

	return {
		subscribe,

		async loadMenuItems(): Promise<void> {
			const state = get({ subscribe });
			update((s) => ({ ...s, loading: true }));

			try {
				const response = await menuItemsApi.listMenuItems(
					state.categoryId,
					state.skip,
					state.limit
				);

				if (response.success && Array.isArray(response.data)) {
					const items = response.data;
					update((s) => ({
						...s,
						items,
						// Estimate total: if items.length === limit, there may be more
						total: items.length === state.limit
							? Math.max(s.total, state.skip + items.length + 1)
							: state.skip + items.length,
						loading: false
					}));
				} else {
					update((s) => ({ ...s, loading: false }));
				}
			} catch (error) {
				update((s) => ({ ...s, loading: false }));
				throw error;
			}
		},

		async createMenuItem(payload: MenuItemCreate): Promise<ApiResponse<MenuItemResponse>> {
			const response = await menuItemsApi.createMenuItem(payload);

			if (response.success && response.data) {
				update((s) => ({
					...s,
					items: [...s.items, response.data!],
					total: s.total + 1
				}));
			}

			return response;
		},

		async updateMenuItem(id: string, payload: MenuItemUpdate): Promise<ApiResponse<MenuItemResponse>> {
			const response = await menuItemsApi.updateMenuItem(id, payload);

			if (response.success && response.data) {
				update((s) => ({
					...s,
					items: s.items.map((item) =>
						item.id === id ? response.data! : item
					)
				}));
			}

			return response;
		},

		async deleteMenuItem(id: string): Promise<ApiResponse<Record<string, never>>> {
			const response = await menuItemsApi.deleteMenuItem(id);

			if (response.success) {
				update((s) => ({
					...s,
					items: s.items.filter((item) => item.id !== id),
					total: Math.max(0, s.total - 1)
				}));
			}

			return response;
		},

		setFilter(categoryId: string | null): void {
			update((s) => ({ ...s, categoryId, skip: 0 }));
		},

		setSearch(search: string): void {
			update((s) => ({ ...s, search, skip: 0 }));
		},

		setPagination(skip: number, limit: number): void {
			update((s) => ({ ...s, skip, limit }));
		},

		reset(): void {
			set({ ...defaultState });
		}
	};
}

export const menuItemsStore = createMenuItemsStore();
