<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, AlertCircle } from 'lucide-svelte';
	import { categoriesStore } from '$lib/stores/categories';
	import type { CategoryResponse } from '$lib/api/categories.api';
	import CategoryModal from '$lib/components/category/CategoryModal.svelte';

	let modalOpen = false;
	let editingCategory: CategoryResponse | null = null;
	let errorMessage = '';
	let successMessage = '';
	let deleteConfirmId: string | null = null;
	let modalComponent: CategoryModal | undefined;

	$: categories = $categoriesStore.categories;
	$: loading = $categoriesStore.loading;
	$: total = $categoriesStore.total;
	$: skip = $categoriesStore.skip;
	$: limit = $categoriesStore.limit;
	$: totalPages = Math.max(1, Math.ceil(total / limit));
	$: currentPage = Math.floor(skip / limit) + 1;
	$: hasNextPage = categories.length === limit;
	$: hasPrevPage = skip > 0;
	$: from = total === 0 ? 0 : skip + 1;
	$: to = skip + categories.length;

	onMount(() => {
		loadData();
	});

	function loadData(): void {
		clearMsg();
		categoriesStore.loadCategories().catch((err: unknown) => {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat data kategori.';
		});
	}

	function handleOpenCreate(): void {
		editingCategory = null;
		clearMsg();
		modalOpen = true;
	}

	function handleOpenEdit(cat: CategoryResponse): void {
		editingCategory = { ...cat };
		clearMsg();
		modalOpen = true;
	}

	function handleCloseModal(): void {
		modalOpen = false;
		editingCategory = null;
	}

	function clearMsg(): void {
		errorMessage = '';
		successMessage = '';
	}

	async function handleSubmit(event: CustomEvent<{
		payload: { name: string; description?: string; is_active: boolean };
		isEdit: boolean;
		id?: string;
	}>): Promise<void> {
		const d = event.detail;
		clearMsg();

		try {
			if (d.isEdit && d.id) {
				const r = await categoriesStore.updateCategory(d.id, d.payload);
				if (r.success) {
					successMessage = 'Kategori berhasil diperbarui.';
					handleCloseModal();
				} else {
					errorMessage = r.message || 'Gagal memperbarui kategori.';
					if (r.errors) modalComponent?.setServerErrors(r.errors);
				}
			} else {
				const r = await categoriesStore.createCategory(d.payload);
				if (r.success) {
					successMessage = 'Kategori berhasil ditambahkan.';
					handleCloseModal();
				} else {
					errorMessage = r.message || 'Gagal menambahkan kategori.';
					if (r.errors) modalComponent?.setServerErrors(r.errors);
				}
			}
		} catch (err: unknown) {
			const e = err as { message?: string; errors?: Record<string, string[]> };
			if (e.errors) {
				errorMessage = Object.entries(e.errors)
					.map(([k, v]) => `${k}: ${v.join(', ')}`)
					.join('; ');
				modalComponent?.setServerErrors(e.errors);
			} else {
				errorMessage = e.message || 'Gagal menyimpan kategori.';
			}
		}
	}

	function handleDelete(id: string): void {
		if (deleteConfirmId !== id) {
			deleteConfirmId = id;
			return;
		}

		clearMsg();
		categoriesStore
			.deleteCategory(id)
			.then((r) => {
				if (r.success) {
					successMessage = 'Kategori berhasil dihapus.';
					// Jika halaman terakhir menjadi kosong, mundur satu halaman
					if (categories.length === 1 && skip > 0) {
						categoriesStore.setPagination(Math.max(0, skip - limit), limit);
					}
					return categoriesStore.loadCategories();
				}
				errorMessage = r.message || 'Gagal menghapus kategori.';
				return Promise.resolve();
			})
			.catch((err: unknown) => {
				const e = err as { message?: string };
				errorMessage = e.message || 'Gagal menghapus kategori.';
			})
			.finally(() => {
				deleteConfirmId = null;
			});
	}

	function cancelDelete(): void {
		deleteConfirmId = null;
	}

	function goToPage(p: number): void {
		if (p < 1 || p > totalPages || p === currentPage) return;
		categoriesStore.setPagination((p - 1) * limit, limit);
		loadData();
	}

	function goToPageNumber(p: number | string): void {
		if (typeof p === 'number') goToPage(p);
	}

	function changeLimit(n: number): void {
		categoriesStore.setPagination(0, n);
		loadData();
	}

	function handleLimitChange(e: Event): void {
		changeLimit(Number((e.target as HTMLSelectElement).value));
	}

	$: pageNumbers = (() => {
		const ps: (number | string)[] = [];
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) ps.push(i);
		} else {
			ps.push(1);
			if (currentPage > 3) ps.push('...');
			for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) ps.push(i);
			if (currentPage < totalPages - 2) ps.push('...');
			if (!ps.includes(totalPages)) ps.push(totalPages);
		}
		return ps;
	})();
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
			<p class="mt-1 text-sm text-gray-500">Kelola kategori produk untuk menu F&B Anda</p>
		</div>
		<button on:click={handleOpenCreate} class="btn-primary inline-flex items-center gap-2">
			<Plus class="h-5 w-5" />
			Tambah Kategori
		</button>
	</div>

	{#if errorMessage}
		<div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			<AlertCircle class="h-5 w-5 shrink-0" />
			<span class="flex-1">{errorMessage}</span>
			<button on:click={() => (errorMessage = '')} class="font-bold hover:text-red-900" aria-label="Tutup">&times;</button>
		</div>
	{/if}
	{#if successMessage}
		<div class="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
			<span class="flex-1">{successMessage}</span>
			<button on:click={() => (successMessage = '')} class="font-bold hover:text-green-900" aria-label="Tutup">&times;</button>
		</div>
	{/if}

	<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-gray-500">
				{#if loading}
					Memuat data...
				{:else}
					Menampilkan <span class="font-medium text-gray-700">{from}–{to}</span> dari <span class="font-medium text-gray-700">{total}</span> kategori
				{/if}
			</p>
			<div class="flex items-center gap-2">
				<label for="limit-select" class="text-sm text-gray-500">Tampilkan:</label>
				<select
					id="limit-select"
					value={limit}
					on:change={handleLimitChange}
					class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
				</select>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nama</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Deskripsi</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
						<th scope="col" class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if loading}
						<tr>
							<td colspan="4" class="px-6 py-12 text-center text-sm text-gray-500">
								<div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
								<p class="mt-3">Memuat kategori...</p>
							</td>
						</tr>
					{:else if categories.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-12 text-center">
								<Inbox class="mx-auto h-10 w-10 text-gray-300" />
								<p class="mt-3 text-sm font-medium text-gray-700">Belum ada kategori</p>
								<p class="mt-1 text-sm text-gray-500">Klik "Tambah Kategori" untuk membuat kategori pertama.</p>
							</td>
						</tr>
					{:else}
						{#each categories as cat (cat.id)}
							<tr class="transition hover:bg-gray-50">
								<td class="px-6 py-4">
									<p class="text-sm font-medium text-gray-900">{cat.name}</p>
								</td>
								<td class="max-w-md px-6 py-4">
									<p class="truncate text-sm text-gray-600" title={cat.description ?? ''}>
										{cat.description ?? '—'}
									</p>
								</td>
								<td class="px-6 py-4">
									{#if cat.is_active}
										<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
											<span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
											Active
										</span>
									{:else}
										<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
											<span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
											Inactive
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end gap-2">
										{#if deleteConfirmId === cat.id}
											<span class="mr-1 hidden text-xs text-gray-500 sm:inline">Hapus kategori ini?</span>
											<button
												on:click={() => handleDelete(cat.id)}
												class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
											>
												Ya
											</button>
											<button
												on:click={cancelDelete}
												class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
											>
												Batal
											</button>
										{:else}
											<button
												on:click={() => handleOpenEdit(cat)}
												class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
												aria-label="Edit {cat.name}"
											>
												<Pencil class="h-3.5 w-3.5" />
												Edit
											</button>
											<button
												on:click={() => handleDelete(cat.id)}
												class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
												aria-label="Hapus {cat.name}"
											>
												<Trash2 class="h-3.5 w-3.5" />
												Hapus
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
				<button
					on:click={() => goToPage(currentPage - 1)}
					disabled={!hasPrevPage}
					class="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Halaman sebelumnya"
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
				{#each pageNumbers as p, i (i)}
					{#if p === '...'}
						<span class="px-2 text-sm text-gray-400">&hellip;</span>
					{:else}
						<button
							on:click={() => goToPageNumber(p)}
							class="rounded-lg px-3 py-2 text-sm font-medium transition {p === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
							aria-current={p === currentPage ? 'page' : undefined}
						>
							{p}
						</button>
					{/if}
				{/each}
				<button
					on:click={() => goToPage(currentPage + 1)}
					disabled={!hasNextPage}
					class="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Halaman berikutnya"
				>
					<ChevronRight class="h-4 w-4" />
				</button>
			</nav>
		</div>
	</div>
</div>

<CategoryModal bind:this={modalComponent} open={modalOpen} category={editingCategory} on:close={handleCloseModal} on:submit={handleSubmit} />

