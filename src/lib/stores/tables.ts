import { writable } from 'svelte/store';
import * as tableApi from '$lib/api/tables';

export const tables = writable([]);
export const loading = writable(false);
export const statusFilter = writable('all');

export const loadTables = async (status = 'all') => {
    loading.set(true);
    try {
        const { data } = await tableApi.listTables(status);
        tables.set(data.data);
    } catch (error) {
        console.error('Failed to load tables:', error);
    } finally {
        loading.set(false);
    }
};

export const createTable = async (data) => {
    await tableApi.createTable(data);
    loadTables();
};

export const updateTable = async (id, data) => {
    await tableApi.updateTable(id, data);
    loadTables();
};

export const deleteTable = async (id) => {
    await tableApi.deleteTable(id);
    loadTables();
};
