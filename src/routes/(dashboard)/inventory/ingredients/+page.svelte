<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, X, CheckCircle2, AlertCircle, Inbox, Loader2 } from 'lucide-svelte';
	import { inventoryStore } from '$lib/stores/inventory';
	import type { Ingredient } from '$lib/stores/inventory';
	import InventoryNav from '$lib/components/inventory/InventoryNav.svelte';

	let showForm = false;
	let editing: Ingredient | null = null;
	let formName = '';
	let formUnit = '';
	let formActive = true;
	let submitting = false;
	let errorMessage = '';
	let successMessage = '';

	$: ingredients = $inventoryStore.ingredients;
	$: loading = $inventoryStore.loading;

	onMount(() => {
		loadData();
	});

	function loadData(): void {
		clearMsg();
		inventoryStore.loadIngredients().catch((err: unknown) => {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat bahan baku.';
		});
	}

	function clearMsg(): void {
		errorMessage = '';
		successMessage = '';
	}

	function openCreate(): void {
		editing = null;
		formName = '';
		formUnit = '';
		formActive = true;
		clearMsg();
		showForm = true;
	}

	function openEdit(ing: Ingredient): void {
		editing = ing;
		formName = ing.name;
		formUnit = ing.unit;
		formActive = ing.is_active;
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

		const name = formName.trim();
		const unit = formUnit.trim();
		if (!name || !unit) {
			errorMessage = 'Nama dan satuan wajib diisi.';
			return;
		}

		submitting = true;
		try {
			if (editing) {
				const r = await inventoryStore.updateIngredient(editing.id, {
					name,
					unit,
					is_active: formActive
				});
				if (r.success) {
					successMessage = 'Bahan baku berhasil diperbarui.';
					closeForm();
				} else {
					errorMessage = r.message || 'Gagal memperbarui bahan baku.';
				}
			} else {
				const r = await inventoryStore.createIngredient({
					name,
					unit,
					is_active: formActive
				});
				if (r.success) {
					successMessage = 'Bahan baku berhasil ditambahkan.';
					closeForm();
				} else {
					errorMessage = r.message || 'Gagal menambahkan bahan baku.';
				}
			}
		} catch (err: unknown) {
			const e = err as { message?: string };
			errorMessage = e.message || 'Terjadi kesalahan saat menyimpan bahan baku.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="space-y-6">
	<header>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Bahan Baku</h1>
				<p class="mt-1 text-sm text-gray-500">Kelola daftar ingredient / bahan baku yang digunakan.</p>
			</div>
			<button on:click={openCreate} class="btn-primary inline-flex items-center gap-2">
				<Plus class="h-4 w-4" />
				Tambah Bahan
			</button>
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

	{#if showForm}
		<div class="card">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-base font-semibold text-gray-900">{editing ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}</h2>
				<button
					on:click={closeForm}
					class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
					aria-label="Tutup form"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<label for="ingredient-name" class="mb-1 block text-sm font-medium text-gray-700">Nama</label>
					<input
						id="ingredient-name"
						type="text"
						bind:value={formName}
						placeholder="cth: Tepung Terigu"
						class="input-field"
					/>
				</div>
				<div>
					<label for="ingredient-unit" class="mb-1 block text-sm font-medium text-gray-700">Satuan</label>
					<input
						id="ingredient-unit"
						type="text"
						bind:value={formUnit}
						placeholder="cth: kg, pcs, liter"
						class="input-field"
					/>
				</div>
				<div class="flex items-end pb-1">
					<label class="inline-flex cursor-pointer items-center gap-2">
						<input
							type="checkbox"
							bind:checked={formActive}
							class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
						/>
						<span class="text-sm font-medium text-gray-700">Aktif</span>
					</label>
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
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nama</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Satuan</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
						<th scope="col" class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#if loading && ingredients.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-12 text-center">
								<Loader2 class="mx-auto h-6 w-6 animate-spin text-gray-400" />
								<p class="mt-2 text-sm text-gray-500">Memuat bahan baku...</p>
							</td>
						</tr>
					{:else if ingredients.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-12 text-center">
								<Inbox class="mx-auto h-10 w-10 text-gray-300" />
								<p class="mt-2 text-sm font-medium text-gray-500">Belum ada bahan baku.</p>
								<p class="text-sm text-gray-400">Klik "Tambah Bahan" untuk menambahkan.</p>
							</td>
						</tr>
					{:else}
						{#each ingredients as ing}
							<tr class="transition hover:bg-gray-50">
								<td class="px-6 py-4 text-sm font-medium text-gray-900">{ing.name}</td>
								<td class="px-6 py-4 text-sm text-gray-600">{ing.unit}</td>
								<td class="px-6 py-4">
									{#if ing.is_active}
										<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Aktif</span>
									{:else}
										<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Nonaktif</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-right">
									<button
										on:click={() => openEdit(ing)}
										class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
										aria-label="Edit {ing.name}"
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

