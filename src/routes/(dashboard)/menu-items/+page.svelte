<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-svelte';
	import { menuItemsStore } from '$lib/stores/menu-items';
	import { listCategories } from '$lib/api/categories.api';
	import type { MenuItemResponse } from '$lib/api/menu-items.api';
	import type { CategoryResponse } from '$lib/api/categories.api';
	import MenuItemModal from '$lib/components/menu-item/MenuItemModal.svelte';

	let modalOpen = false;
	let editingItem: MenuItemResponse | null = null;
	let errorMessage = '';
	let successMessage = '';
	let deleteConfirmId: string | null = null;
	let modalComponent: MenuItemModal | undefined;

	let categories: CategoryResponse[] = [];
	let searchInput = '';
	let searchTimeout: ReturnType<typeof setTimeout>;

	$: items = $menuItemsStore.items;
	$: loading = $menuItemsStore.loading;
	$: total = $menuItemsStore.total;
	$: skip = $menuItemsStore.skip;
	$: limit = $menuItemsStore.limit;
	$: categoryId = $menuItemsStore.categoryId;
	$: search = $menuItemsStore.search;
	$: totalPages = Math.max(1, Math.ceil(total / limit));
	$: currentPage = Math.floor(skip / limit) + 1;
	$: hasNextPage = items.length === limit;
	$: hasPrevPage = skip > 0;
	$: from = total === 0 ? 0 : skip + 1;
	$: to = skip + items.length;

	onMount(() => {
		loadCategories();
		menuItemsStore.loadMenuItems().catch((err: unknown) => {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat data menu item.';
		});
	});

	async function loadCategories(): Promise<void> {
		try {
			const res = await listCategories(0, 200);
			if (res.success && Array.isArray(res.data)) categories = res.data;
		} catch { /* silent */ }
	}

	function loadData(): void {
		clearMsg();
		menuItemsStore.loadMenuItems().catch((err: unknown) => {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat data menu item.';
		});
	}

	function handleCategoryFilter(e: Event): void {
		const val = (e.target as HTMLSelectElement).value || null;
		menuItemsStore.setFilter(val);
		loadData();
	}

	function onSearchKeyup(): void {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			menuItemsStore.setSearch(searchInput);
			loadData();
		}, 400);
	}

	function handleOpenCreate(): void {
		editingItem = null;
		clearMsg();
		modalOpen = true;
	}

	function handleOpenEdit(item: MenuItemResponse): void {
		editingItem = { ...item };
		clearMsg();
		modalOpen = true;
	}

	function handleCloseModal(): void {
		modalOpen = false;
		editingItem = null;
	}

	function clearMsg(): void {
		errorMessage = '';
		successMessage = '';
	}

	function getCategoryName(catId: string): string {
		return categories.find((c) => c.id === catId)?.name ?? '—';
	}

	function formatPrice(price: string): string {
		const num = Number(price);
		return num.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
	}

	async function handleSubmit(event: CustomEvent<{
		payload: import('$lib/api/menu-items.api').MenuItemCreate;
		isEdit: boolean; id?: string;
	}>): Promise<void> {
		const d = event.detail;
		clearMsg();
		try {
			if (d.isEdit && d.id) {
				const r = await menuItemsStore.updateMenuItem(d.id, d.payload);
				if (r.success) { successMessage = 'Menu item berhasil diperbarui.'; handleCloseModal(); }
				else { errorMessage = r.message || 'Gagal memperbarui.'; if (r.errors) modalComponent?.setServerErrors(r.errors); }
			} else {
				const r = await menuItemsStore.createMenuItem(d.payload);
				if (r.success) { successMessage = 'Menu item berhasil ditambahkan.'; handleCloseModal(); }
				else { errorMessage = r.message || 'Gagal menambahkan.'; if (r.errors) modalComponent?.setServerErrors(r.errors); }
			}
		} catch (err: unknown) {
			const e = err as { message?: string; errors?: Record<string, string[]> };
			if (e.errors) {
				errorMessage = Object.entries(e.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ');
				modalComponent?.setServerErrors(e.errors);
			} else { errorMessage = e.message || 'Gagal menyimpan menu item.'; }
		}
	}

	function handleDelete(id: string): void {
		if (deleteConfirmId !== id) { deleteConfirmId = id; return; }
		clearMsg();
		menuItemsStore.deleteMenuItem(id)
			.then((r) => {
				if (r.success) {
					successMessage = 'Menu item berhasil dihapus.';
					if (items.length === 1 && skip > 0) { menuItemsStore.setPagination(skip - limit, limit); loadData(); }
				} else { errorMessage = r.message || 'Gagal menghapus.'; }
			})
			.catch((err: unknown) => { errorMessage = (err as { message?: string }).message || 'Gagal menghapus.'; })
			.finally(() => { deleteConfirmId = null; });
	}

	function cancelDelete(): void { deleteConfirmId = null; }

	function goToPage(page: number): void {
		if (page < 1 || page > totalPages) return;
		menuItemsStore.setPagination((page - 1) * limit, limit);
		loadData();
	}

	function getPageNumbers(): (number | string)[] {
		const pages: (number | string)[] = [];
		if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
		else {
			pages.push(1);
			if (currentPage > 3) pages.push('...');
			for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
			if (currentPage < totalPages - 2) pages.push('...');
			pages.push(totalPages);
		}
		return pages;
	}

	$: pageNumbers = getPageNumbers();
	$: filteredItems = items;
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Menu Items</h1>
			<p class="mt-1 text-sm text-gray-500">Kelola daftar menu dan item produk.</p>
		</div>
		<button on:click={handleOpenCreate}
			class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
			<Plus class="h-4 w-4" /> Tambah Menu Item
		</button>
	</div>

	{#if errorMessage}
		<div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
	{/if}
	{#if successMessage}
		<div class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{successMessage}</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="flex items-center gap-2">
			<label for="category-filter" class="text-sm font-medium text-gray-600 whitespace-nowrap">Kategori:</label>
			<select id="category-filter" value={categoryId ?? ''} on:change={handleCategoryFilter}
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
				<option value="">Semua Kategori</option>
				{#each categories as cat (cat.id)}<option value={cat.id}>{cat.name}</option>{/each}
			</select>
		</div>
		<div class="relative flex-1 sm:max-w-xs">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input type="text" bind:value={searchInput} on:keyup={onSearchKeyup} placeholder="Cari nama menu..."
				class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
		</div>
	</div>

	<!-- Table Card -->
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nama</th>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kategori</th>
						<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Harga</th>
						<th class="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
						<th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if loading}
						<tr><td colspan="5" class="px-6 py-12 text-center">
							<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
							<p class="mt-2 text-sm text-gray-500">Memuat data...</p>
						</td></tr>
					{:else if filteredItems.length === 0}
						<tr><td colspan="5" class="px-6 py-12 text-center">
							<Inbox class="mx-auto h-12 w-12 text-gray-300" />
							<p class="mt-3 text-sm text-gray-500">Tidak ada menu item ditemukan.</p>
						</td></tr>
					{:else}
						{#each filteredItems as item (item.id)}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										{#if item.image_url}
											<img src={item.image_url} alt={item.name} class="h-10 w-10 rounded-lg object-cover" />
										{:else}
											<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><Inbox class="h-5 w-5" /></div>
										{/if}
										<div>
											<p class="text-sm font-medium text-gray-900">{item.name}</p>
											{#if item.description}<p class="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</p>{/if}
										</div>
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-gray-600">{getCategoryName(item.category_id)}</td>
								<td class="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(item.base_price)}</td>
								<td class="px-6 py-4 text-center space-y-1">
									{#if item.is_available}<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Tersedia</span>{:else}<span class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Habis</span>{/if}
									{#if !item.is_active}<span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 ml-1">Nonaktif</span>{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end gap-2">
										{#if deleteConfirmId === item.id}
											<span class="mr-1 hidden text-xs text-gray-500 sm:inline">Hapus ini?</span>
											<button on:click={() => handleDelete(item.id)} class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700">Ya</button>
											<button on:click={cancelDelete} class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">Batal</button>
										{:else}
											<button on:click={() => handleOpenEdit(item)} class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
												<Pencil class="h-3.5 w-3.5" /> Edit
											</button>
											<button on:click={() => handleDelete(item.id)} class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">
												<Trash2 class="h-3.5 w-3.5" /> Hapus
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<div class="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 sm:flex-row">
			<p class="text-sm text-gray-500">
				Halaman <span class="font-medium text-gray-700">{currentPage}</span> dari <span class="font-medium text-gray-700">{totalPages}</span>
			</p>
			<nav class="flex items-center gap-1" aria-label="Pagination">
				<button on:click={() => goToPage(currentPage - 1)} disabled={!hasPrevPage}
					class="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
					<ChevronLeft class="h-4 w-4" />
				</button>
				{#each pageNumbers as p, i (i)}
					{#if p === '...'}
						<span class="px-2 text-sm text-gray-400">&hellip;</span>
					{:else}
						<button on:click={() => { if (typeof p === 'number') goToPage(p); }}
							class="rounded-lg px-3 py-2 text-sm font-medium transition {p === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">{p}</button>
					{/if}
				{/each}
				<button on:click={() => goToPage(currentPage + 1)} disabled={!hasNextPage}
					class="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
					<ChevronRight class="h-4 w-4" />
				</button>
			</nav>
		</div>
	</div>
</div>

<MenuItemModal bind:this={modalComponent} open={modalOpen} menuItem={editingItem} on:close={handleCloseModal} on:submit={handleSubmit} />
