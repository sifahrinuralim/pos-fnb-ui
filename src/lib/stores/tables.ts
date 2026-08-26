import { writable } from 'svelte/store';
import * as tableApi from '$lib/api/tables';
import type { Table, TableStatus, TableCreate, TableUpdate } from '$lib/api/tables';

export type TableStatusFilter = 'all' | TableStatus;

export const tables = writable<Table[]>([]);
export const loading = writable(false);
export const statusFilter = writable<TableStatusFilter>('all');

export const loadTables = async (status: TableStatusFilter = 'all') => {
    loading.set(true);
    try {
        const { data } = await tableApi.listTables(status);
        tables.set(data);
    } catch (error) {
        console.error('Failed to load tables:', error);
    } finally {
        loading.set(false);
    }
};

export const createTable = async (data: TableCreate) => {
    await tableApi.createTable(data);
    loadTables();
};

export const updateTable = async (id: string, data: TableUpdate) => {
    await tableApi.updateTable(id, data);
    loadTables();
};

export const deleteTable = async (id: string) => {
    await tableApi.deleteTable(id);
    loadTables();
};
