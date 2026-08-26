import { writable, get } from 'svelte/store';
import { listMenuItems } from '$lib/api/menu-items.api';
import type { MenuItemResponse } from '$lib/api/menu-items.api';

interface MenuState {
items: MenuItemResponse[];
loading: boolean;
filter: { category_id: string; search: string };
pagination: { skip: number; limit: number; total: number };
}

function createMenuStore() {
const { subscribe, set, update } = writable<MenuState>({
items: [],
loading: false,
filter: { category_id: '', search: '' },
pagination: { skip: 0, limit: 20, total: 0 }
});

return {
subscribe,
loadItems: async () => {
const state = get({ subscribe });
update((s) => ({ ...s, loading: true }));
try {
const res = await listMenuItems(state.filter.category_id || undefined, state.pagination.skip, state.pagination.limit);
update((s) => ({
...s,
items: res.data,
pagination: { ...s.pagination, total: res.data.length },
loading: false
}));
} catch (e) {
update((s) => ({ ...s, loading: false }));
}
},
setFilter: (category_id: string, search: string) => {
update((s) => ({ ...s, filter: { category_id, search }, pagination: { ...s.pagination, skip: 0 } }));
},
setPage: (skip: number) => {
update((s) => ({ ...s, pagination: { ...s.pagination, skip } }));
}
};
}

export const menuStore = createMenuStore();