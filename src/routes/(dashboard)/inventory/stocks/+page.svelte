<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Plus,
		Pencil,
		X,
		CheckCircle2,
		AlertCircle,
		Inbox,
		Loader2,
		AlertTriangle,
		Boxes,
		RefreshCw
	} from 'lucide-svelte';
	import { inventoryStore } from '$lib/stores/inventory';
	import type { InventoryItem } from '$lib/stores/inventory';
	import { toggleOutOfStockAvailability } from '$lib/services/inventory';
	import InventoryNav from '$lib/components/inventory/InventoryNav.svelte';

	let showForm = false;
	let editing: InventoryItem | null = null;
	let formIngredientId = '';
	let formQuantity = '';
	let formMinimum = '';
	let formPrice = '';
	let submitting = false;
	let toggling = false;
	let errorMessage = '';
	let successMessage = '';

	$: ingredients = $inventoryStore.ingredients;
	$: inventory = $inventoryStore.inventory;
	$: loading = $inventoryStore.loading;
	$: lowStockCount = inventory.filter((i) => i.is_low_stock).length;

	onMount(() => {
		loadData();
	});

	async function loadData(): Promise<void> {
		clearMsg();
		try {
			await Promise.all([inventoryStore.loadIngredients(), inventoryStore.loadInventory()]);
		} catch (err: unknown) {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat data stok.';
		}
	}

	function clearMsg(): void {
		errorMessage = '';
		successMessage = '';
	}

	function openCreate(): void {
		editing = null;
		formIngredientId = '';
		formQuantity = '';
		formMinimum = '';
		formPrice = '';
		clearMsg();
		showForm = true;
	}

	function openEdit(item: InventoryItem): void {
		editing = item;
		formIngredientId = item.ingredient_id;
		formQuantity = String(item.stock_quantity);
		formMinimum = String(item.minimum_stock);
		formPrice = String(item.unit_price);
		clearMsg();
		showForm = true;
	}

	function closeForm(): void {
		showForm = false;
		editing = null;
		submitting = false;
	}

	async function handleSubmit(): Promise<void> {
		clearMsg();

		if (!formIngredientId) {
			errorMessage = 'Pilih bahan baku terlebih dahulu.';
			return;
		}

		const quantity = Number(formQuantity);
		const minimum = Number(formMinimum);
		const price = Number(formPrice);

		if (!Number.isFinite(quantity) || quantity < 0) {
			errorMessage = 'Jumlah stok harus berupa angka yang valid.';
			return;
		}
		if (!Number.isFinite(minimum) || minimum < 0) {
			errorMessage = 'Stok minimum harus berupa angka yang valid.';
			return;
		}
		if (!Number.isFinite(price) || price < 0) {
			errorMessage = 'Harga satuan harus berupa angka yang valid.';
			return;
		}

		submitting = true;
		try {
			if (editing) {
				const r = await inventoryStore.updateInventory(editing.id, {
					stock_quantity: quantity,
					minimum_stock: minimum,
					unit_price: price
				});
				if (r.success) {
					successMessage = 'Stok berhasil diperbarui.';
					closeForm();
					inventoryStore.loadLowStock().catch(() => {});
				} else {
					errorMessage = r.message || 'Gagal memperbarui stok.';
				}
			} else {
				const r = await inventoryStore.createInventory({
					ingredient_id: formIngredientId,
					stock_quantity: quantity,
					minimum_stock: minimum,
					unit_price: price
				});
				if (r.success) {
					successMessage = 'Stok berhasil ditambahkan.';
					closeForm();
					inventoryStore.loadLowStock().catch(() => {});
				} else {
					errorMessage = r.message || 'Gagal menambahkan stok.';
				}
			}
		} catch (err: unknown) {
			const e = err as { message?: string };
			errorMessage = e.message || 'Terjadi kesalahan saat menyimpan stok.';
		} finally {
			submitting = false;
		}
	}

	async function handleToggle(): Promise<void> {
		toggling = true;
		clearMsg();
		try {
			await toggleOutOfStockAvailability();
			successMessage = 'Status ketersediaan global berhasil diperbarui.';
		} catch (err: unknown) {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal mengubah status ketersediaan.';
		} finally {
			toggling = false;
		}
	}

	function formatRupiah(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(value);
	}
</script>
<div class="space-y-6">
	<header>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Stok Bahan Baku</h1>
				<p class="mt-1 text-sm text-gray-500">Pantau dan kelola stok bahan baku.</p>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<button
					on:click={handleToggle}
					disabled={toggling}
					class="btn-secondary inline-flex items-center gap-2"
				>
					<RefreshCw class="h-4 w-4 {toggling ? 'animate-spin' : ''}" />
					Toggle Availability
				</button>
				<button on:click={openCreate} class="btn-primary inline-flex items-center gap-2">
					<Plus class="h-4 w-4" />
					Tambah Stok
				</button>
			</div>
		</div>
		<div class="mt-4">
			<InventoryNav />
		</div>
	</header>

	{#if errorMessage}
		<div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			<AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
			<span>{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
			<CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0" />
			<span>{successMessage}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="card">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
					<Boxes class="h-5 w-5" />
				</div>
				<div>
					<p class="text-xs font-medium uppercase tracking-wider text-gray-500">Total Stok</p>
					<p class="text-xl font-bold text-gray-900">{inventory.length}</p>
				</div>
			</div>
		</div>
		<div class="card border-red-200 bg-red-50">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
					<AlertTriangle class="h-5 w-5" />
				</div>
				<div>
					<p class="text-xs font-medium uppercase tracking-wider text-red-600">Low Stock</p>
					<p class="text-xl font-bold text-red-700">{lowStockCount}</p>
				</div>
			</div>
		</div>
		<div class="card">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
					<CheckCircle2 class="h-5 w-5" />
				</div>
				<div>
					<p class="text-xs font-medium uppercase tracking-wider text-gray-500">Stok Aman</p>
					<p class="text-xl font-bold text-gray-900">{inventory.length - lowStockCount}</p>
				</div>
			</div>
		</div>
	</div>
	{#if showForm}
		<div class="card">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-base font-semibold text-gray-900">{editing ? 'Edit Stok' : 'Tambah Stok'}</h2>
				<button
					on:click={closeForm}
					class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
					aria-label="Tutup form"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<div>
					<label for="stock-ingredient" class="mb-1 block text-sm font-medium text-gray-700">Bahan Baku</label>
					<select id="stock-ingredient" bind:value={formIngredientId} disabled={!!editing} class="input-field">
						<option value="">— Pilih Bahan Baku —</option>
						{#each ingredients as ing}
							<option value={ing.id}>{ing.name} ({ing.unit})</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="stock-quantity" class="mb-1 block text-sm font-medium text-gray-700">Jumlah Stok</label>
					<input
						id="stock-quantity"
						type="number"
						min="0"
						step="any"
						bind:value={formQuantity}
						placeholder="cth: 50"
						class="input-field"
					/>
				</div>
				<div>
					<label for="stock-minimum" class="mb-1 block text-sm font-medium text-gray-700">Stok Minimum</label>
					<input
						id="stock-minimum"
						type="number"
						min="0"
						step="any"
						bind:value={formMinimum}
						placeholder="cth: 10"
						class="input-field"
					/>
				</div>
				<div>
					<label for="stock-price" class="mb-1 block text-sm font-medium text-gray-700">Harga Satuan (Rp)</label>
					<input
						id="stock-price"
						type="number"
						min="0"
						step="any"
						bind:value={formPrice}
						placeholder="cth: 15000"
						class="input-field"
					/>
				</div>
				<div class="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-1">
					<button type="button" on:click={closeForm} class="btn-secondary">Batal</button>
					<button type="submit" disabled={submitting} class="btn-primary inline-flex items-center gap-2">
						{#if submitting}
							<Loader2 class="h-4 w-4 animate-spin" />
						{/if}
						{editing ? 'Simpan Perubahan' : 'Simpan'}
					</button>
				</div>
			</form>
		</div>
	{/if}
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Bahan Baku</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Satuan</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stok</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stok Minimum</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Harga Satuan</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
						<th scope="col" class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#if loading && inventory.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center">
								<Loader2 class="mx-auto h-6 w-6 animate-spin text-gray-400" />
								<p class="mt-2 text-sm text-gray-500">Memuat data stok...</p>
							</td>
						</tr>
					{:else if inventory.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center">
								<Inbox class="mx-auto h-10 w-10 text-gray-300" />
								<p class="mt-2 text-sm font-medium text-gray-500">Belum ada data stok.</p>
								<p class="text-sm text-gray-400">Klik "Tambah Stok" untuk menambahkan.</p>
							</td>
						</tr>
					{:else}
						{#each inventory as item}
							<tr class="transition {item.is_low_stock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}">
								<td class="px-6 py-4 text-sm font-medium text-gray-900">{item.ingredient_name}</td>
								<td class="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
								<td class="px-6 py-4 text-sm">
									<span class={item.is_low_stock ? 'font-bold text-red-700' : 'font-medium text-gray-900'}>{item.stock_quantity}</span>
								</td>
								<td class="px-6 py-4 text-sm text-gray-600">{item.minimum_stock}</td>
								<td class="px-6 py-4 text-sm text-gray-600">{formatRupiah(item.unit_price)}</td>
								<td class="px-6 py-4">
									{#if item.is_low_stock}
										<span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
											<AlertTriangle class="h-3 w-3" />
											Low Stock
										</span>
									{:else}
										<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Cukup</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-right">
									<button
										on:click={() => openEdit(item)}
										class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
										aria-label="Edit stok {item.ingredient_name}"
									>
										<Pencil class="h-3.5 w-3.5" />
										Edit
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

