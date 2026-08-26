import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
	id: string;
	table_number: number;
	name: string | null;
	seat_capacity: number;
	status: TableStatus;
	created_at?: string;
	updated_at?: string;
}

/** Payload for creating a table. `table_number`/`seat_capacity` accept string
 *  to support raw form binding (e.g. <input type="number">). */
export interface TableCreate {
	table_number: number | string;
	name?: string | null;
	seat_capacity: number | string;
	status: TableStatus;
}

export type TableUpdate = Partial<TableCreate>;

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** GET /api/v1/tables?status= → data: Table[] */
export async function listTables(status: TableStatus | 'all' = 'all'): Promise<ApiResponse<Table[]>> {
	const params: Record<string, unknown> = {};
	if (status && status !== 'all') params.status = status;
	return apiGet<Table[]>('/tables', params);
}

/** POST /api/v1/tables */
export async function createTable(data: TableCreate): Promise<ApiResponse<Table>> {
	return apiPost<Table>('/tables', data);
}

/** PATCH /api/v1/tables/{table_id} */
export async function updateTable(id: string, data: TableUpdate): Promise<ApiResponse<Table>> {
	return apiPatch<Table>(`/tables/${id}`, data);
}

/** DELETE /api/v1/tables/{table_id} */
export async function deleteTable(id: string): Promise<ApiResponse<Record<string, never>>> {
	return apiDelete<Record<string, never>>(`/tables/${id}`);
}
