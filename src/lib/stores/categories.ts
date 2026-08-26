import { writable, get } from 'svelte/store';
import * as categoriesApi from '$lib/api/categories.api';
import type { ApiResponse } from '$lib/services/api';
import type { CategoryCreate, CategoryUpdate, CategoryResponse } from '$lib/api/categories.api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CategoriesState {
	categories: CategoryResponse[];
	loading: boolean;
	total: number;
	skip: number;
	limit: number;
}

const defaultState: CategoriesState = {
	categories: [],
	loading: false,
	total: 0,
	skip: 0,
	limit: 20
};

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

function createCategoriesStore() {
	const { subscribe, set, update } = writable<CategoriesState>({ ...defaultState });

	return {
		subscribe,

		async loadCategories(): Promise<void> {
			const state = get({ subscribe });
			update((s) => ({ ...s, loading: true }));

			try {
				const response = await categoriesApi.listCategories(state.skip, state.limit);

				if (response.success && Array.isArray(response.data)) {
					const items = response.data;
					update((s) => ({
						...s,
						categories: items,
						// Estimate total: if items === limit, there may be more
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

		async createCategory(payload: CategoryCreate): Promise<ApiResponse<CategoryResponse>> {
			const response = await categoriesApi.createCategory(payload);

			if (response.success && response.data) {
				update((s) => ({
					...s,
					categories: [...s.categories, response.data!],
					total: s.total + 1
				}));
			}

			return response;
		},

		async updateCategory(id: string, payload: CategoryUpdate): Promise<ApiResponse<CategoryResponse>> {
			const response = await categoriesApi.updateCategory(id, payload);

			if (response.success && response.data) {
				update((s) => ({
					...s,
					categories: s.categories.map((cat) =>
						cat.id === id ? response.data! : cat
					)
				}));
			}

			return response;
		},

		async deleteCategory(id: string): Promise<ApiResponse<Record<string, never>>> {
			const response = await categoriesApi.deleteCategory(id);

			if (response.success) {
				update((s) => ({
					...s,
					categories: s.categories.filter((cat) => cat.id !== id),
					total: Math.max(0, s.total - 1)
				}));
			}

			return response;
		},

		setPagination(skip: number, limit: number): void {
			update((s) => ({ ...s, skip, limit }));
		},

		reset(): void {
			set({ ...defaultState });
		}
	};
}

export const categoriesStore = createCategoriesStore();
