import { writable, get } from 'svelte/store';
import * as tablesApi from '$lib/api/tables';
import type { ApiResponse } from '$lib/services/api';
import type { Table, TableStatus, TableCreate, TableUpdate } from '$lib/api/tables';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type TableStatusFilter = 'all' | TableStatus;

export interface TablesState {
	tables: Table[];
	loading: boolean;
	statusFilter: TableStatusFilter;
}

const defaultState: TablesState = {
	tables: [],
	loading: false,
	statusFilter: 'all'
};

const sortByNumber = (a: Table, b: Table): number => a.table_number - b.table_number;

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

function createTablesStore() {
	const { subscribe, set, update } = writable<TablesState>({ ...defaultState });

	return {
		subscribe,

		async loadTables(): Promise<void> {
			const state = get({ subscribe });
			update((s) => ({ ...s, loading: true }));

			try {
				const response = await tablesApi.listTables(state.statusFilter);

				if (response.success && Array.isArray(response.data)) {
					update((s) => ({
						...s,
						tables: response.data!.sort(sortByNumber),
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

		setStatusFilter(status: TableStatusFilter): void {
			update((s) => ({ ...s, statusFilter: status }));
		},

		async createTable(payload: TableCreate): Promise<ApiResponse<Table>> {
			const response = await tablesApi.createTable(payload);

			if (response.success && response.data) {
				const state = get({ subscribe });
				const created = response.data!;

				// Hanya tampilkan jika sesuai filter aktif
				if (state.statusFilter === 'all' || state.statusFilter === created.status) {
					update((s) => ({
						...s,
						tables: [...s.tables, created].sort(sortByNumber)
					}));
				}
			}

			return response;
		},

		async updateTable(id: string, payload: TableUpdate): Promise<ApiResponse<Table>> {
			const response = await tablesApi.updateTable(id, payload);

			if (response.success && response.data) {
				const state = get({ subscribe });
				const updated = response.data!;
				const matchesFilter = state.statusFilter === 'all' || state.statusFilter === updated.status;

				update((s) => ({
					...s,
					tables: matchesFilter
						? s.tables.map((t) => (t.id === id ? updated : t)).sort(sortByNumber)
						: s.tables.filter((t) => t.id !== id)
				}));
			}

			return response;
		},

		async deleteTable(id: string): Promise<ApiResponse<Record<string, never>>> {
			const response = await tablesApi.deleteTable(id);

			if (response.success) {
				update((s) => ({
					...s,
					tables: s.tables.filter((t) => t.id !== id)
				}));
			}

			return response;
		},

		reset(): void {
			set({ ...defaultState });
		}
	};
}

export const tablesStore = createTablesStore();
