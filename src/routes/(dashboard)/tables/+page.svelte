<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, Users, Inbox, AlertCircle, CheckCircle2 } from 'lucide-svelte';
	import { tablesStore } from '$lib/stores/tables';
	import type { Table, TableStatus, TableCreate } from '$lib/api/tables';
	import TableForm from '$lib/components/tables/TableForm.svelte';

	type FilterValue = 'all' | TableStatus;

	const filters: { value: FilterValue; label: string }[] = [
		{ value: 'all', label: 'Semua' },
		{ value: 'available', label: 'Tersedia' },
		{ value: 'occupied', label: 'Terisi' },
		{ value: 'reserved', label: 'Dipesan' }
	];

	const statusConfig: Record<TableStatus, { label: string; badge: string; border: string; dot: string }> = {
		available: {
			label: 'Tersedia',
			badge: 'bg-green-100 text-green-700',
			border: 'border-l-green-500',
			dot: 'bg-green-500'
		},
		occupied: {
			label: 'Terisi',
			badge: 'bg-red-100 text-red-700',
			border: 'border-l-red-500',
			dot: 'bg-red-500'
		},
		reserved: {
			label: 'Dipesan',
			badge: 'bg-amber-100 text-amber-700',
			border: 'border-l-amber-500',
			dot: 'bg-amber-500'
		}
	};

	let modalOpen = false;
	let editingTable: Table | null = null;
	let modalComponent: TableForm | undefined;
	let errorMessage = '';
	let successMessage = '';
	let deleteConfirmId: string | null = null;

	$: tables = $tablesStore.tables;
	$: loading = $tablesStore.loading;
	$: statusFilter = $tablesStore.statusFilter;

	onMount(() => {
		loadData();
	});

	function loadData(): void {
		clearMsg();
		tablesStore.loadTables().catch((err: unknown) => {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat data meja.';
		});
	}

	function handleSetFilter(value: FilterValue): void {
		if (value === statusFilter) return;
		tablesStore.setStatusFilter(value);
		loadData();
	}

	function handleOpenCreate(): void {
		editingTable = null;
		clearMsg();
		modalOpen = true;
	}

	function handleOpenEdit(table: Table): void {
		editingTable = { ...table };
		clearMsg();
		modalOpen = true;
	}

	function handleCloseModal(): void {
		modalOpen = false;
		editingTable = null;
	}

	function clearMsg(): void {
		errorMessage = '';
		successMessage = '';
	}

	async function handleSubmit(event: CustomEvent<{ payload: TableCreate; isEdit: boolean; id?: string }>): Promise<void> {
		const detail = event.detail;
		clearMsg();

		try {
			if (detail.isEdit && detail.id) {
				const r = await tablesStore.updateTable(detail.id, detail.payload);
				if (r.success) {
					successMessage = 'Meja berhasil diperbarui.';
					handleCloseModal();
				} else {
					errorMessage = r.message || 'Gagal memperbarui meja.';
					if (r.errors) modalComponent?.setServerErrors(r.errors);
				}
			} else {
				const r = await tablesStore.createTable(detail.payload);
				if (r.success) {
					successMessage = 'Meja berhasil ditambahkan.';
					handleCloseModal();
				} else {
					errorMessage = r.message || 'Gagal menambahkan meja.';
					if (r.errors) modalComponent?.setServerErrors(r.errors);
				}
			}
		} catch (err: unknown) {
			const e = err as { message?: string; errors?: Record<string, string[]> };
			if (e.errors) {
				errorMessage = Object.entries(e.errors)
					.map(([key, values]) => `${key}: ${values.join(', ')}`)
					.join('; ');
				modalComponent?.setServerErrors(e.errors);
			} else {
				errorMessage = e.message || 'Gagal menyimpan meja.';
			}
		}
	}

	function handleDelete(id: string): void {
		if (deleteConfirmId !== id) {
			deleteConfirmId = id;
			return;
		}

		clearMsg();
		tablesStore
			.deleteTable(id)
			.then((r) => {
				if (r.success) {
					successMessage = 'Meja berhasil dihapus.';
					return;
				}
				errorMessage = r.message || 'Gagal menghapus meja.';
			})
			.catch((err: unknown) => {
				const e = err as { message?: string };
				errorMessage = e.message || 'Gagal menghapus meja.';
			})
			.finally(() => {
				deleteConfirmId = null;
			});
	}

	function cancelDelete(): void {
		deleteConfirmId = null;
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Manajemen Meja</h1>
			<p class="mt-1 text-sm text-gray-500">Kelola meja untuk area kasir dan layanan F&B Anda</p>
		</div>
		<button on:click={handleOpenCreate} class="btn-primary inline-flex items-center gap-2">
			<Plus class="h-5 w-5" />
			Tambah Meja
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
			<CheckCircle2 class="h-5 w-5 shrink-0" />
			<span class="flex-1">{successMessage}</span>
			<button on:click={() => (successMessage = '')} class="font-bold hover:text-green-900" aria-label="Tutup">&times;</button>
		</div>
	{/if}

	<!-- Filter Status -->
	<div class="flex flex-wrap items-center gap-2">
		<span class="mr-1 text-sm font-medium text-gray-500">Status:</span>
		{#each filters as filter}
			<button
				on:click={() => handleSetFilter(filter.value)}
				class="rounded-full px-4 py-1.5 text-sm font-medium transition
					{filter.value === statusFilter
						? 'bg-gray-900 text-white shadow-sm'
						: 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}"
			>
				{filter.label}
			</button>
		{/each}
	</div>

	<!-- Grid Meja -->
	{#if loading}
		<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
			<p class="mt-3 text-sm text-gray-500">Memuat meja...</p>
		</div>
	{:else if tables.length === 0}
		<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
			<Inbox class="h-10 w-10 text-gray-300" />
			<p class="mt-3 text-sm font-medium text-gray-700">
				{statusFilter === 'all' ? 'Belum ada meja' : 'Tidak ada meja dengan status ini'}
			</p>
			<p class="mt-1 text-sm text-gray-500">
				{statusFilter === 'all' ? 'Klik "Tambah Meja" untuk membuat meja pertama.' : 'Coba pilih filter status lain.'}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each tables as table (table.id)}
				<div
					class="flex flex-col rounded-xl border border-gray-200 border-l-4 bg-white shadow-sm transition hover:shadow-md
						{statusConfig[table.status].border}"
				>
					<div class="flex items-start justify-between gap-2">
						<div>
							<p class="text-2xl font-bold text-gray-900">#{table.table_number}</p>
							<p class="mt-0.5 text-sm text-gray-500">{table.name || 'Tanpa nama'}</p>
						</div>
						<span
							class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
								{statusConfig[table.status].badge}"
						>
							<span class="h-1.5 w-1.5 rounded-full {statusConfig[table.status].dot}"></span>
							{statusConfig[table.status].label}
						</span>
					</div>

					<div class="mt-4 flex items-center gap-2 text-sm text-gray-600">
						<Users class="h-4 w-4 text-gray-400" />
						<span>Kapasitas: {table.seat_capacity} kursi</span>
					</div>

					<div class="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
						{#if deleteConfirmId === table.id}
							<span class="mr-auto text-xs text-gray-500">Hapus meja ini?</span>
							<button
								on:click={() => handleDelete(table.id)}
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
								on:click={() => handleOpenEdit(table)}
								class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
								aria-label="Edit meja {table.table_number}"
							>
								<Pencil class="h-3.5 w-3.5" />
								Edit
							</button>
							<button
								on:click={() => handleDelete(table.id)}
								class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
								aria-label="Hapus meja {table.table_number}"
							>
								<Trash2 class="h-3.5 w-3.5" />
								Hapus
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<TableForm
	bind:this={modalComponent}
	open={modalOpen}
	table={editingTable}
	on:close={handleCloseModal}
	on:submit={handleSubmit}
/>
